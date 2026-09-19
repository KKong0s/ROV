/**
 * ROV Global Ban-Pick Tracker — Multi-Team & Live Sync Application Logic
 * บันทึกฮีโร่ที่แต่ละทีมเลือกเล่นไปแล้ว เพื่อใช้ในการแบนไม่ให้เล่นซ้ำ (Global Ban Rule)
 * รองรับหลายทีม, สลับดูแต่ละทีม, ดูกระดานสรุปทุกทีม
 * ระบบ Live Sync (PeerJS WebRTC P2P) ซิงค์ข้ามมือถือ/คอมฯ แบบ Real-time ไม่ต้องมีเซิร์ฟเวอร์
 */

// ─── State Management ───
const STORAGE_KEY = 'rov_teams_tracker_v2';
const LEGACY_STORAGE_KEY = 'rov_played_heroes';

let state = {
  activeTeamId: 'team_1',
  teams: [
    { id: 'team_1', name: 'ทีมเรา', heroes: [] },
    { id: 'team_2', name: 'ทีมตรงข้าม', heroes: [] }
  ]
};

let currentSearch = '';
let currentRole = 'all';
let currentStatus = 'all';
let editingTeamId = null;

// ─── Live Sync (PeerJS P2P) State ───
const PEER_PREFIX = 'rov-ban-room-';
let peer = null;
let currentRoomId = null;
let isHost = false;
let connections = []; // สำหรับโฮสต์: เก็บ conn ทุกคน / สำหรับเกสต์: เก็บ conn โฮสต์
let myControlledTeamId = 'all'; // 'all' (กรรมการ) หรือ team.id ที่ตัวเองรับผิดชอบ

// ─── Toast Notifications ───
function showToast(message, icon = 'ℹ️', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── LocalStorage Persistence & Migration ───
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.teams) && parsed.teams.length > 0) {
        state = parsed;
        if (!state.teams.some(t => t.id === state.activeTeamId)) {
          state.activeTeamId = state.teams[0].id;
        }
        return;
      }
    }

    // Auto-migration จากเวอร์ชันเดี่ยวเก่า
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        state.teams[0].heroes = parsedLegacy;
        saveState();
        return;
      }
    }
  } catch (e) {
    console.error('โหลดข้อมูลสถานะไม่สำเร็จ:', e);
  }
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('บันทึกข้อมูลสถานะไม่สำเร็จ:', e);
  }
}

// ─── Team Helper Functions ───
function getActiveTeam() {
  let team = state.teams.find(t => t.id === state.activeTeamId);
  if (!team) {
    team = state.teams[0];
    state.activeTeamId = team.id;
  }
  return team;
}

function getActiveHeroesSet() {
  const team = getActiveTeam();
  const set = new Set(team.heroes || []);
  // กฎ Global Ban: หากทีมเล่น Flowborn สายใดสายหนึ่งแล้ว อีกสายหนึ่งจะถูกแบนด้วยทันที
  if (set.has('flowborn_carry')) {
    set.add('flowborn_mage');
  } else if (set.has('flowborn_mage')) {
    set.add('flowborn_carry');
  }
  return set;
}

function addTeam(name) {
  const cleanName = name.trim() || `ทีม ${state.teams.length + 1}`;
  const newId = 'team_' + Date.now();
  const newTeam = {
    id: newId,
    name: cleanName,
    heroes: []
  };

  state.teams.push(newTeam);
  state.activeTeamId = newId;
  saveState();
  renderTeamsBar();
  renderHeroes();
  updateTeamSelectOptions();
  broadcastState(`เพิ่มทีม "${cleanName}" เข้าระบบ`);
}

function renameTeam(id, newName) {
  const team = state.teams.find(t => t.id === id);
  if (team) {
    const oldName = team.name;
    team.name = newName.trim() || team.name;
    saveState();
    renderTeamsBar();
    updateProgress();
    updateTeamSelectOptions();
    broadcastState(`เปลี่ยนชื่อทีม "${oldName}" เป็น "${team.name}"`);
  }
}

function deleteTeam(id) {
  if (state.teams.length <= 1) {
    alert('ต้องมีอย่างน้อย 1 ทีมในระบบ');
    return;
  }
  const deletedTeam = state.teams.find(t => t.id === id);
  const deletedName = deletedTeam ? deletedTeam.name : '';

  state.teams = state.teams.filter(t => t.id !== id);
  if (state.activeTeamId === id) {
    state.activeTeamId = state.teams[0].id;
  }
  saveState();
  renderTeamsBar();
  renderHeroes();
  updateTeamSelectOptions();
  broadcastState(`ลบทีม "${deletedName}" ออกจากระบบ`);
}

function switchTeam(id) {
  if (state.activeTeamId === id) return;
  state.activeTeamId = id;
  saveState();
  renderTeamsBar();
  renderHeroes();
}

function resetActiveTeam() {
  const team = getActiveTeam();
  if (team) {
    team.heroes = [];
    saveState();
    renderTeamsBar();
    renderHeroes();
    broadcastState(`ล้างข้อมูลฮีโร่ของ "${team.name}" แล้ว`);
  }
}

function resetAllTeams() {
  state.teams.forEach(t => {
    t.heroes = [];
  });
  saveState();
  renderTeamsBar();
  renderHeroes();
  broadcastState(`ล้างข้อมูลฮีโร่ทุกทีม (เริ่มแมตช์ใหม่)`);
}

// ─── Toggle Hero (พร้อมการจำกัดสิทธิ์ทีมที่คุม) ───
function toggleHero(heroId) {
  // ตรวจสอบสิทธิ์การคุมทีม (Team Lock)
  if (myControlledTeamId !== 'all' && myControlledTeamId !== state.activeTeamId) {
    const myTeam = state.teams.find(t => t.id === myControlledTeamId);
    const targetTeam = state.teams.find(t => t.id === state.activeTeamId);
    showToast(
      `คุณได้รับสิทธิ์คุมเฉพาะ "${myTeam ? myTeam.name : 'ทีมของคุณ'}" ไม่สามารถแก้ไข "${targetTeam ? targetTeam.name : 'ทีมนี้'}" ได้`,
      '🔒',
      3500
    );
    return;
  }

  const team = getActiveTeam();
  if (!team.heroes) team.heroes = [];

  let isNowPlayed = false;
  let heroObj = HEROES.find(h => h.id === heroId);
  let heroName = heroObj ? heroObj.name : heroId;

  // กฎเฉพาะของ Flowborn: แข่งขันจริงในแมตช์จะหยิบได้เพียง 1 สายต่อทีม
  if (heroId === 'flowborn_carry') {
    const carryIdx = team.heroes.indexOf('flowborn_carry');
    const mageIdx = team.heroes.indexOf('flowborn_mage');

    if (carryIdx !== -1) {
      team.heroes.splice(carryIdx, 1);
      isNowPlayed = false;
    } else {
      if (mageIdx !== -1) team.heroes.splice(mageIdx, 1);
      team.heroes.push('flowborn_carry');
      isNowPlayed = true;
    }
  } else if (heroId === 'flowborn_mage') {
    const carryIdx = team.heroes.indexOf('flowborn_carry');
    const mageIdx = team.heroes.indexOf('flowborn_mage');

    if (mageIdx !== -1) {
      team.heroes.splice(mageIdx, 1);
      isNowPlayed = false;
    } else {
      if (carryIdx !== -1) team.heroes.splice(carryIdx, 1);
      team.heroes.push('flowborn_mage');
      isNowPlayed = true;
    }
  } else {
    // ฮีโร่ทั่วไป
    const index = team.heroes.indexOf(heroId);
    isNowPlayed = (index === -1);
    if (isNowPlayed) {
      team.heroes.push(heroId);
    } else {
      team.heroes.splice(index, 1);
    }
  }

  saveState();
  renderTeamsBar();
  renderWithAnimation(heroId, isNowPlayed);

  // Broadcast ให้เครื่องอื่นทราบแบบ Real-time
  const actionText = isNowPlayed
    ? `${team.name} แบน ${heroName} แล้ว`
    : `${team.name} ปลดแบน ${heroName}`;
  broadcastState(actionText);
}

// ─── Debounce ───
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ─── Render Teams Navigation Bar ───
function renderTeamsBar() {
  const nav = document.getElementById('teams-nav');
  if (!nav) return;

  nav.innerHTML = '';
  const fragment = document.createDocumentFragment();

  state.teams.forEach(team => {
    const isActive = team.id === state.activeTeamId;
    const tab = document.createElement('button');
    tab.className = 'team-tab' + (isActive ? ' active' : '');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.dataset.id = team.id;

    const count = team.heroes ? team.heroes.length : 0;

    let editBtnHtml = '';
    if (isActive) {
      editBtnHtml = `
        <span class="team-edit-trigger" title="แก้ไขชื่อหรือลบทีม" aria-label="แก้ไขทีม">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </span>`;
    }

    tab.innerHTML = `
      <span class="team-tab-name">${team.name}</span>
      <span class="team-tab-badge">${count} ตัว</span>
      ${editBtnHtml}
    `;

    tab.addEventListener('click', (e) => {
      const editTrigger = e.target.closest('.team-edit-trigger');
      if (editTrigger) {
        e.stopPropagation();
        openTeamModal('edit', team);
        return;
      }
      switchTeam(team.id);
    });

    fragment.appendChild(tab);
  });

  nav.appendChild(fragment);
}

// ─── Progress Update ───
function updateProgress() {
  const activeTeam = getActiveTeam();
  const total = HEROES.length;
  const playedCount = activeTeam.heroes ? activeTeam.heroes.length : 0;
  const pct = total === 0 ? 0 : Math.round((playedCount / total) * 100);

  const statsEl = document.getElementById('stats');
  const fillEl = document.getElementById('progress-fill');
  const barEl = fillEl ? fillEl.parentElement : null;

  if (statsEl) {
    statsEl.textContent = `กำลังดู: ${activeTeam.name} • แบนแล้ว ${playedCount} / ${total} ตัว (${pct}%)`;
  }
  if (fillEl) {
    fillEl.style.width = `${pct}%`;
  }
  if (barEl) {
    barEl.setAttribute('aria-valuenow', pct);
  }
}

// ─── Get Filtered & Sorted Heroes ───
function getFilteredHeroes() {
  const playedSet = getActiveHeroesSet();
  const searchTerm = currentSearch.toLowerCase().trim();

  // 1. กรองตามการค้นหา, ตำแหน่ง (Role), และสถานะ (Status)
  const filtered = HEROES.filter(hero => {
    // ค้นหา
    if (searchTerm) {
      const nameMatch = hero.name.toLowerCase().includes(searchTerm);
      const aliasMatch = hero.aliases && hero.aliases.some(a => a.toLowerCase().includes(searchTerm));
      if (!nameMatch && !aliasMatch) return false;
    }
    // ตำแหน่ง
    if (currentRole !== 'all') {
      if (hero.role !== currentRole && hero.role2 !== currentRole) return false;
    }
    // สถานะ Global Ban ของทีมที่กำลังดูอยู่
    const isPlayed = playedSet.has(hero.id);
    if (currentStatus === 'played' && !isPlayed) return false;
    if (currentStatus === 'unplayed' && isPlayed) return false;

    return true;
  });

  // 2. จัดเรียง: ตัวที่ติดแบน (เล่นแล้ว) ขึ้นไปอยู่บนสุดเสมอ + เรียงตัวอักษร A-Z สวยงาม
  filtered.sort((a, b) => {
    const aPlayed = playedSet.has(a.id);
    const bPlayed = playedSet.has(b.id);

    if (currentStatus === 'all') {
      if (aPlayed && !bPlayed) return -1;
      if (!aPlayed && bPlayed) return 1;
    }

    return a.name.localeCompare(b.name, 'th');
  });

  return filtered;
}

// ─── Render Heroes DOM ───
function renderHeroes(animatingId = null, isNowPlayed = false) {
  const grid = document.getElementById('hero-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  const playedSet = getActiveHeroesSet();
  const filtered = getFilteredHeroes();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    updateProgress();
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  const fragment = document.createDocumentFragment();

  filtered.forEach(hero => {
    const isPlayed = playedSet.has(hero.id);
    const card = document.createElement('div');

    const isTargetAnimating = (hero.id === animatingId && isNowPlayed);
    card.className = 'hero-card' + (isPlayed ? ' played' : '') + (isTargetAnimating ? ' pop-animate' : '');
    card.dataset.id = hero.id;
    card.setAttribute('role', 'listitem');

    // ข้อความแสตมป์แบนสำหรับ Flowborn
    if (isPlayed) {
      const activeTeam = getActiveTeam();
      const heroesList = activeTeam.heroes || [];
      if (hero.id === 'flowborn_carry') {
        if (heroesList.includes('flowborn_carry')) {
          card.dataset.banLabel = '🚫 แบน (Carry)';
        } else {
          card.dataset.banLabel = '🚫 แบนคู่ (ใช้แล้ว)';
        }
      } else if (hero.id === 'flowborn_mage') {
        if (heroesList.includes('flowborn_mage')) {
          card.dataset.banLabel = '🚫 แบน (Mage)';
        } else {
          card.dataset.banLabel = '🚫 แบนคู่ (ใช้แล้ว)';
        }
      }
    }

    const firstLetter = hero.name.charAt(0).toUpperCase();

    card.innerHTML = `
      <div class="hero-img-wrapper">
        <img class="hero-img" src="${hero.image}" alt="${hero.name}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="hero-img-fallback">${firstLetter}</div>
      </div>
      <div class="hero-info">
        <div class="hero-name">${hero.name}</div>
        <div class="hero-role">${hero.role}${hero.role2 ? ' / ' + hero.role2 : ''}</div>
      </div>`;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      toggleHero(hero.id);
    });

    fragment.appendChild(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);
  updateProgress();
}

// ─── Render with FLIP Animation ───
function renderWithAnimation(toggledId, isNowPlayed) {
  const grid = document.getElementById('hero-grid');
  if (!grid) {
    renderHeroes(toggledId, isNowPlayed);
    return;
  }

  const prevPositions = new Map();
  const currentCards = grid.querySelectorAll('.hero-card');
  currentCards.forEach(card => {
    prevPositions.set(card.dataset.id, card.getBoundingClientRect());
  });

  renderHeroes(toggledId, isNowPlayed);

  const nextCards = grid.querySelectorAll('.hero-card');
  nextCards.forEach(card => {
    const id = card.dataset.id;
    const prevRect = prevPositions.get(id);

    if (prevRect) {
      const nextRect = card.getBoundingClientRect();
      const dx = prevRect.left - nextRect.left;
      const dy = prevRect.top - nextRect.top;

      if (dx !== 0 || dy !== 0) {
        card.style.transform = `translate(${dx}px, ${dy}px)`;
        card.style.transition = 'none';

        requestAnimationFrame(() => {
          card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1)';
          card.style.transform = '';

          setTimeout(() => {
            card.style.transition = '';
          }, 420);
        });
      }
    }
  });

  if (toggledId && isNowPlayed) {
    setTimeout(() => {
      const targetCard = grid.querySelector(`.hero-card[data-id="${toggledId}"]`);
      if (targetCard) {
        targetCard.classList.remove('pop-animate');
      }
    }, 450);
  }
}

// ─── Overview Modal (ดูสรุปฮีโร่ทุกทีม) ───
function renderOverviewModal() {
  const container = document.getElementById('overview-container');
  if (!container) return;

  container.innerHTML = '';

  const heroMap = new Map();
  HEROES.forEach(h => heroMap.set(h.id, h));

  state.teams.forEach(team => {
    const card = document.createElement('div');
    card.className = 'team-overview-card';

    const heroesList = team.heroes || [];
    let heroItemsHtml = '';

    if (heroesList.length === 0) {
      heroItemsHtml = '<div class="overview-empty">ยังไม่มีฮีโร่ที่เล่นในทีมนี้ (ยังไม่ติด Global Ban)</div>';
    } else {
      heroItemsHtml = '<div class="team-overview-heroes">';
      heroesList.forEach(heroId => {
        const hero = heroMap.get(heroId);
        const name = hero ? hero.name : heroId;
        const img = hero ? hero.image : '';
        heroItemsHtml += `
          <div class="overview-hero-chip">
            <img class="overview-hero-img" src="${img}" alt="${name}" onerror="this.style.display='none'">
            <span>${name}</span>
          </div>
        `;
      });
      heroItemsHtml += '</div>';
    }

    card.innerHTML = `
      <div class="team-overview-head">
        <div class="team-overview-name">⚔️ ${team.name}</div>
        <div class="team-overview-count">${heroesList.length} ตัว</div>
      </div>
      ${heroItemsHtml}
    `;

    container.appendChild(card);
  });
}

function openOverviewModal() {
  const overlay = document.getElementById('overview-modal-overlay');
  if (!overlay) return;

  renderOverviewModal();
  overlay.style.display = '';
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeOverviewModal() {
  const overlay = document.getElementById('overview-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        overlay.style.display = 'none';
      }
    }, 300);
  }
}

// ─── Add / Edit Team Modal ───
function openTeamModal(mode = 'add', team = null) {
  const overlay = document.getElementById('team-modal-overlay');
  const title = document.getElementById('team-modal-title');
  const input = document.getElementById('team-name-input');
  const deleteWrapper = document.getElementById('team-delete-wrapper');

  if (!overlay || !input) return;

  if (mode === 'add') {
    editingTeamId = null;
    title.textContent = '➕ เพิ่มทีมใหม่';
    input.value = `ทีม ${state.teams.length + 1}`;
    if (deleteWrapper) deleteWrapper.style.display = 'none';
  } else if (mode === 'edit' && team) {
    editingTeamId = team.id;
    title.textContent = `✏️ แก้ไขทีม: ${team.name}`;
    input.value = team.name;
    if (deleteWrapper) {
      deleteWrapper.style.display = (state.teams.length > 1) ? 'block' : 'none';
    }
  }

  overlay.style.display = '';
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
  setTimeout(() => {
    input.focus();
    input.select();
  }, 100);
}

function closeTeamModal() {
  const overlay = document.getElementById('team-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        overlay.style.display = 'none';
      }
    }, 300);
  }
}

// ─── Reset Confirmation Modal ───
function showResetModal() {
  const overlay = document.getElementById('modal-overlay');
  const desc = document.getElementById('modal-reset-desc');
  const confirmTeamBtn = document.getElementById('modal-confirm-team');
  const activeTeam = getActiveTeam();

  if (desc) {
    desc.textContent = `ต้องการล้างข้อมูลฮีโร่ของ "${activeTeam.name}" หรือล้างทุกทีมทั้งหมด?`;
  }
  if (confirmTeamBtn) {
    confirmTeamBtn.textContent = `ล้างเฉพาะ "${activeTeam.name}"`;
  }

  if (overlay) {
    overlay.style.display = '';
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }
}

function hideResetModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        overlay.style.display = 'none';
      }
    }, 300);
  }
}

// ─── Live Sync (PeerJS P2P) Core Engine ───

function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'ROV-' + code;
}

function updateSyncUI() {
  const statusBtn = document.getElementById('sync-status-btn');
  const statusText = document.getElementById('sync-status-text');
  const connectedSec = document.getElementById('sync-connected-section');
  const disconnectedSec = document.getElementById('sync-disconnected-section');
  const codeVal = document.getElementById('room-code-val');
  const peersCount = document.getElementById('room-peers-count');
  const roleBadge = document.getElementById('room-role-badge');

  if (currentRoomId) {
    const totalCount = isHost ? connections.length + 1 : 2;
    if (statusBtn) {
      statusBtn.className = 'sync-status-pill online';
    }
    if (statusText) {
      statusText.textContent = `🟢 ห้อง: ${currentRoomId} (${totalCount} เครื่อง)`;
    }
    if (connectedSec) connectedSec.style.display = 'block';
    if (disconnectedSec) disconnectedSec.style.display = 'none';
    if (codeVal) codeVal.textContent = currentRoomId;
    if (peersCount) peersCount.textContent = `👥 ผู้เชื่อมต่อ: ${totalCount} เครื่อง`;
    if (roleBadge) {
      roleBadge.textContent = isHost ? '👑 โฮสต์ (Host)' : '🤝 ผู้ร่วมห้อง (Member)';
    }
  } else {
    if (statusBtn) {
      statusBtn.className = 'sync-status-pill offline';
    }
    if (statusText) {
      statusText.textContent = '🔴 ใช้งานในเครื่อง (ออฟไลน์)';
    }
    if (connectedSec) connectedSec.style.display = 'none';
    if (disconnectedSec) disconnectedSec.style.display = 'grid';
  }
}

function updateTeamSelectOptions() {
  const select = document.getElementById('my-team-select');
  if (!select) return;

  const currentVal = select.value || 'all';
  select.innerHTML = '<option value="all">👑 ผู้ดูแล / กรรมการ (กดแบนได้ทุกทีม)</option>';

  state.teams.forEach(team => {
    const opt = document.createElement('option');
    opt.value = team.id;
    opt.textContent = `🛡️ ผู้ดูแลทีม: ${team.name}`;
    if (team.id === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

function createRoom() {
  if (typeof Peer === 'undefined') {
    alert('กำลังโหลดระบบเครือข่าย กรุณาลองใหม่อีกครั้งใน 2-3 วินาที');
    return;
  }

  const roomCode = generateRoomCode();
  const peerId = PEER_PREFIX + roomCode.toLowerCase();

  showToast(`กำลังสร้างห้อง ${roomCode}...`, '⏳');

  if (peer) {
    peer.destroy();
  }

  peer = new Peer(peerId);

  peer.on('open', (id) => {
    isHost = true;
    currentRoomId = roomCode;
    connections = [];
    updateSyncUI();
    showToast(`สร้างห้อง ${roomCode} สำเร็จ!`, '🎉');
  });

  peer.on('connection', (conn) => {
    connections.push(conn);

    conn.on('open', () => {
      // ส่งข้อมูลทีมทั้งหมดให้ผู้เข้าร่วมใหม่
      conn.send({
        type: 'INIT_STATE',
        teams: state.teams,
        actionDesc: 'เชื่อมต่อห้องแข่งสดสำเร็จ'
      });
      updateSyncUI();
      showToast(`มีเครื่องใหม่เข้าร่วมห้อง (${connections.length + 1} เครื่อง)`, '👥');
    });

    conn.on('data', (data) => {
      handleIncomingData(data, conn);
    });

    conn.on('close', () => {
      connections = connections.filter(c => c !== conn);
      updateSyncUI();
      showToast(`มีเครื่องออกจากห้อง (เหลือ ${connections.length + 1} เครื่อง)`, 'ℹ️');
    });

    conn.on('error', (err) => {
      console.warn('Connection error:', err);
    });
  });

  peer.on('error', (err) => {
    console.error('Peer error:', err);
    if (err.type === 'unavailable-id') {
      // สุ่มรหัสใหม่หากซ้ำ
      setTimeout(createRoom, 300);
    } else {
      showToast('เกิดข้อผิดพลาดในการสร้างห้อง: ' + err.type, '⚠️');
    }
  });
}

function joinRoom(targetCode) {
  if (!targetCode) return;
  const cleanCode = targetCode.trim().toUpperCase();
  const peerId = PEER_PREFIX + cleanCode.toLowerCase();

  if (typeof Peer === 'undefined') {
    alert('กำลังโหลดระบบเครือข่าย กรุณาลองใหม่อีกครั้งใน 2-3 วินาที');
    return;
  }

  showToast(`กำลังเชื่อมต่อห้อง ${cleanCode}...`, '⏳');

  if (peer) {
    peer.destroy();
  }

  peer = new Peer();

  peer.on('open', () => {
    const conn = peer.connect(peerId, { reliable: true });

    conn.on('open', () => {
      isHost = false;
      currentRoomId = cleanCode;
      connections = [conn];
      updateSyncUI();
      showToast(`เข้าร่วมห้อง ${cleanCode} สำเร็จ!`, '🎉');
      closeSyncModal();
    });

    conn.on('data', (data) => {
      handleIncomingData(data, conn);
    });

    conn.on('close', () => {
      disconnectRoom(false);
      showToast(`การเชื่อมต่อกับห้อง ${cleanCode} สิ้นสุดลง`, '⚠️');
    });

    conn.on('error', (err) => {
      console.error('Join conn error:', err);
      showToast('ไม่สามารถเชื่อมต่อห้องนี้ได้ ตรวจสอบรหัสห้องอีกครั้ง', '⚠️');
    });
  });

  peer.on('error', (err) => {
    console.error('Peer error:', err);
    showToast('ไม่พบห้องที่ระบุ หรือห้องถูกปิดแล้ว', '⚠️');
  });
}

function disconnectRoom(manual = true) {
  if (peer) {
    peer.destroy();
    peer = null;
  }
  connections = [];
  currentRoomId = null;
  isHost = false;
  updateSyncUI();
  if (manual) showToast('ออกจากห้องแล้ว (กลับสู่โหมดออฟไลน์)', 'ℹ️');
}

function broadcastState(actionDesc = '') {
  if (!currentRoomId) return;

  const payload = {
    type: 'SYNC_STATE',
    teams: state.teams,
    actionDesc,
    sourceTeamId: state.activeTeamId
  };

  if (isHost) {
    connections.forEach(conn => {
      if (conn && conn.open) {
        conn.send(payload);
      }
    });
  } else {
    if (connections[0] && connections[0].open) {
      connections[0].send(payload);
    }
  }
}

function handleIncomingData(data, senderConn) {
  if (!data || !data.type) return;

  if (data.type === 'SYNC_STATE' || data.type === 'INIT_STATE') {
    if (Array.isArray(data.teams)) {
      state.teams = data.teams;
      saveState();
      renderTeamsBar();
      renderHeroes();
      updateProgress();
      updateTeamSelectOptions();
      if (document.getElementById('overview-modal-overlay')?.classList.contains('active')) {
        renderOverviewModal();
      }
    }

    if (data.actionDesc) {
      showToast(data.actionDesc, '⚔️');
    }

    // ถ้าโฮสต์ได้รับข้อมูลจากลูกห้อง ให้กระจาย (Relay) ไปยังลูกห้องคนอื่นๆ ทันที
    if (isHost && data.type === 'SYNC_STATE') {
      connections.forEach(conn => {
        if (conn !== senderConn && conn.open) {
          conn.send(data);
        }
      });
    }
  }
}

function copyRoomInviteLink() {
  if (!currentRoomId) return;
  const baseUrl = window.location.origin + window.location.pathname;
  const inviteUrl = `${baseUrl}?room=${currentRoomId}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      showToast(`คัดลอกลิงก์ห้อง ${currentRoomId} แล้ว! ส่งให้เพื่อนเปิดได้ทันที`, '📋');
    }).catch(() => {
      prompt('คัดลอกลิงก์นี้ส่งให้เพื่อนได้เลย:', inviteUrl);
    });
  } else {
    prompt('คัดลอกลิงก์นี้ส่งให้เพื่อนได้เลย:', inviteUrl);
  }
}

// ─── Modal Live Sync Handlers ───
function openSyncModal() {
  const overlay = document.getElementById('sync-modal-overlay');
  if (!overlay) return;

  updateSyncUI();
  updateTeamSelectOptions();
  overlay.style.display = '';
  overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeSyncModal() {
  const overlay = document.getElementById('sync-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        overlay.style.display = 'none';
      }
    }, 300);
  }
}

// ─── Setup Event Listeners ───
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');

  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentSearch = e.target.value;
      renderHeroes();
    }, 150));
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      currentSearch = '';
      renderHeroes();
    });
  }

  // Keyboard shortcut: / เพื่อค้นหา, Escape เพื่อปิด modal
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName.toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape') {
      hideResetModal();
      closeTeamModal();
      closeOverviewModal();
      closeSyncModal();
    }
  });

  // Role filter
  const roleFilter = document.getElementById('role-filter');
  if (roleFilter) {
    roleFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      roleFilter.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentRole = btn.dataset.role || 'all';
      renderHeroes();
    });
  }

  // Status filter (Global Ban Pick)
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.status-btn');
      if (!btn) return;
      statusFilter.querySelectorAll('.status-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentStatus = btn.dataset.status || 'all';
      renderHeroes();
    });
  }

  // Quick Action buttons
  const addTeamBtn = document.getElementById('add-team-btn');
  if (addTeamBtn) addTeamBtn.addEventListener('click', () => openTeamModal('add'));

  const overviewBtn = document.getElementById('overview-btn');
  if (overviewBtn) overviewBtn.addEventListener('click', openOverviewModal);

  const closeOverviewBtn = document.getElementById('close-overview-btn');
  if (closeOverviewBtn) closeOverviewBtn.addEventListener('click', closeOverviewModal);

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', showResetModal);

  // Reset Modal buttons
  const modalCancel = document.getElementById('modal-cancel');
  if (modalCancel) modalCancel.addEventListener('click', hideResetModal);

  const modalConfirmTeam = document.getElementById('modal-confirm-team');
  if (modalConfirmTeam) {
    modalConfirmTeam.addEventListener('click', () => {
      resetActiveTeam();
      hideResetModal();
    });
  }

  const modalConfirmAll = document.getElementById('modal-confirm-all');
  if (modalConfirmAll) {
    modalConfirmAll.addEventListener('click', () => {
      resetAllTeams();
      hideResetModal();
    });
  }

  // Team Modal buttons & save
  const teamModalCancel = document.getElementById('team-modal-cancel');
  if (teamModalCancel) teamModalCancel.addEventListener('click', closeTeamModal);

  const teamModalSave = document.getElementById('team-modal-save');
  const teamNameInput = document.getElementById('team-name-input');

  const handleSaveTeam = () => {
    const val = teamNameInput ? teamNameInput.value.trim() : '';
    if (editingTeamId) {
      renameTeam(editingTeamId, val);
    } else {
      addTeam(val);
    }
    closeTeamModal();
  };

  if (teamModalSave) teamModalSave.addEventListener('click', handleSaveTeam);
  if (teamNameInput) {
    teamNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSaveTeam();
    });
  }

  const teamModalDelete = document.getElementById('team-modal-delete');
  if (teamModalDelete) {
    teamModalDelete.addEventListener('click', () => {
      if (editingTeamId) {
        const team = state.teams.find(t => t.id === editingTeamId);
        const name = team ? team.name : '';
        if (confirm(`ยืนยันการลบ "${name}" ออกจากระบบ?`)) {
          deleteTeam(editingTeamId);
          closeTeamModal();
        }
      }
    });
  }

  // Live Sync Buttons & Listeners
  const syncStatusBtn = document.getElementById('sync-status-btn');
  if (syncStatusBtn) syncStatusBtn.addEventListener('click', openSyncModal);

  const closeSyncBtn = document.getElementById('close-sync-btn');
  if (closeSyncBtn) closeSyncBtn.addEventListener('click', closeSyncModal);

  const createRoomBtn = document.getElementById('create-room-btn');
  if (createRoomBtn) createRoomBtn.addEventListener('click', createRoom);

  const joinRoomBtn = document.getElementById('join-room-btn');
  const joinRoomInput = document.getElementById('join-room-input');
  if (joinRoomBtn && joinRoomInput) {
    joinRoomBtn.addEventListener('click', () => {
      joinRoom(joinRoomInput.value);
    });
    joinRoomInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') joinRoom(joinRoomInput.value);
    });
  }

  const copyRoomLinkBtn = document.getElementById('copy-room-link-btn');
  if (copyRoomLinkBtn) copyRoomLinkBtn.addEventListener('click', copyRoomInviteLink);

  const disconnectRoomBtn = document.getElementById('disconnect-room-btn');
  if (disconnectRoomBtn) disconnectRoomBtn.addEventListener('click', () => disconnectRoom(true));

  const myTeamSelect = document.getElementById('my-team-select');
  if (myTeamSelect) {
    myTeamSelect.addEventListener('change', (e) => {
      myControlledTeamId = e.target.value;
      if (myControlledTeamId === 'all') {
        showToast('คุณมีสิทธิ์จัดการและแบนฮีโร่ได้ทุกทีม', '👑');
      } else {
        const team = state.teams.find(t => t.id === myControlledTeamId);
        showToast(`คุณถูกตั้งสิทธิ์ให้คุมทีม "${team ? team.name : myControlledTeamId}"`, '🎯');
      }
    });
  }

  // คลิกพื้นหลัง modal เพื่อปิด
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideResetModal();
    });
  }

  const teamModalOverlay = document.getElementById('team-modal-overlay');
  if (teamModalOverlay) {
    teamModalOverlay.addEventListener('click', (e) => {
      if (e.target === teamModalOverlay) closeTeamModal();
    });
  }

  const overviewModalOverlay = document.getElementById('overview-modal-overlay');
  if (overviewModalOverlay) {
    overviewModalOverlay.addEventListener('click', (e) => {
      if (e.target === overviewModalOverlay) closeOverviewModal();
    });
  }

  const syncModalOverlay = document.getElementById('sync-modal-overlay');
  if (syncModalOverlay) {
    syncModalOverlay.addEventListener('click', (e) => {
      if (e.target === syncModalOverlay) closeSyncModal();
    });
  }
}

// ─── Initialization ───
document.addEventListener('DOMContentLoaded', () => {
  if (typeof HEROES === 'undefined' || !Array.isArray(HEROES)) {
    console.error('ไม่พบข้อมูลฮีโร่! ตรวจสอบไฟล์ heroes.js');
    window.HEROES = [];
  }

  loadState();
  setupEventListeners();
  renderTeamsBar();
  renderHeroes();
  updateSyncUI();
  updateTeamSelectOptions();

  // ตรวจสอบ URL Query Parameter ว่ามี ?room=XXXX มาด้วยหรือไม่ (Auto-Join)
  try {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setTimeout(() => {
        joinRoom(roomParam);
      }, 500);
    }
  } catch (e) {
    console.warn('Cannot parse URL query params:', e);
  }
});
