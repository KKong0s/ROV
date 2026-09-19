/**
 * ROV Global Ban-Pick Tracker — Multi-Team Application Logic
 * บันทึกฮีโร่ที่แต่ละทีมเลือกเล่นไปแล้ว เพื่อใช้ในการแบนไม่ให้เล่นซ้ำ (Global Ban Rule)
 * รองรับหลายทีม, เพิ่ม/แก้ไข/ลบทีม, ดูสรุปทุกทีม, และสลับดูแต่ละทีมได้อย่างรวดเร็ว
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
let editingTeamId = null; // สำหรับกรณีเปิด modal แก้ไขชื่อทีม

// ─── LocalStorage Persistence & Migration ───
function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.teams) && parsed.teams.length > 0) {
        state = parsed;
        // ตรวจสอบว่า activeTeamId มีอยู่จริง
        if (!state.teams.some(t => t.id === state.activeTeamId)) {
          state.activeTeamId = state.teams[0].id;
        }
        return;
      }
    }

    // ตรวจสอบข้อมูลเก่า (Legacy single-team data) เพื่อทำ Auto-migration
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
}

function renameTeam(id, newName) {
  const team = state.teams.find(t => t.id === id);
  if (team) {
    team.name = newName.trim() || team.name;
    saveState();
    renderTeamsBar();
    updateProgress();
  }
}

function deleteTeam(id) {
  if (state.teams.length <= 1) {
    alert('ต้องมีอย่างน้อย 1 ทีมในระบบ');
    return;
  }
  state.teams = state.teams.filter(t => t.id !== id);
  if (state.activeTeamId === id) {
    state.activeTeamId = state.teams[0].id;
  }
  saveState();
  renderTeamsBar();
  renderHeroes();
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
  }
}

function resetAllTeams() {
  state.teams.forEach(t => {
    t.heroes = [];
  });
  saveState();
  renderTeamsBar();
  renderHeroes();
}

// ─── Toggle Hero (สำหรับทีมที่กำลังเลือก) ───
function toggleHero(heroId) {
  const team = getActiveTeam();
  if (!team.heroes) team.heroes = [];

  let isNowPlayed = false;

  // กฎเฉพาะของ Flowborn: แข่งขันจริงในแมตช์จะหยิบได้เพียง 1 สายต่อทีม
  if (heroId === 'flowborn_carry') {
    const carryIdx = team.heroes.indexOf('flowborn_carry');
    const mageIdx = team.heroes.indexOf('flowborn_mage');

    if (carryIdx !== -1) {
      // ติ๊กออก (ปลดแบน)
      team.heroes.splice(carryIdx, 1);
      isNowPlayed = false;
    } else {
      // สลับสายหรือเพิ่มใหม่
      if (mageIdx !== -1) team.heroes.splice(mageIdx, 1);
      team.heroes.push('flowborn_carry');
      isNowPlayed = true;
    }
  } else if (heroId === 'flowborn_mage') {
    const carryIdx = team.heroes.indexOf('flowborn_carry');
    const mageIdx = team.heroes.indexOf('flowborn_mage');

    if (mageIdx !== -1) {
      // ติ๊กออก (ปลดแบน)
      team.heroes.splice(mageIdx, 1);
      isNowPlayed = false;
    } else {
      // สลับสายหรือเพิ่มใหม่
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
  renderTeamsBar(); // อัปเดตตัวเลขบนแท็บทีม
  renderWithAnimation(heroId, isNowPlayed);
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

    // ถ้าดู "ทั้งหมด": ให้ตัวที่เล่นแล้วขึ้นมาก่อนตัวที่ยังไม่เล่น
    if (currentStatus === 'all') {
      if (aPlayed && !bPlayed) return -1;
      if (!aPlayed && bPlayed) return 1;
    }

    // ในแต่ละกลุ่ม ให้เรียงลำดับชื่อ A-Z อย่างเป็นระเบียบ
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

  // อัปเดต empty state
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    updateProgress();
    return;
  }
  if (emptyState) emptyState.style.display = 'none';

  // สร้างการ์ด
  const fragment = document.createDocumentFragment();

  filtered.forEach(hero => {
    const isPlayed = playedSet.has(hero.id);
    const card = document.createElement('div');

    // pop-animate จะใส่เฉพาะตัวที่เพิ่งถูกกดติ๊กเท่านั้น
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

  // 1. FIRST: บันทึกตำแหน่งเดิมของการ์ดทุกใบก่อนขยับ
  const prevPositions = new Map();
  const currentCards = grid.querySelectorAll('.hero-card');
  currentCards.forEach(card => {
    prevPositions.set(card.dataset.id, card.getBoundingClientRect());
  });

  // 2. LAST: เรนเดอร์ตำแหน่งใหม่ใน DOM
  renderHeroes(toggledId, isNowPlayed);

  // 3. INVERT & PLAY: คำนวณระยะทางที่เปลี่ยนไป และเลื่อนการ์ดอย่างนุ่มนวล
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

  // 4. ลบคลาส pop-animate ออกเมื่อแอนิเมชันเด้งของตัวที่กดจบลง
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
function openOverviewModal() {
  const overlay = document.getElementById('overview-modal-overlay');
  const container = document.getElementById('overview-container');
  if (!overlay || !container) return;

  container.innerHTML = '';

  // Map ID -> Hero Object เพื่อค้นหารูปและชื่อได้ไว
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
    // แสดงปุ่มลบ ถ้ามีมากกว่า 1 ทีม
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

// ─── Event Listeners ───
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');

  // ค้นหา (debounce 150ms)
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      currentSearch = e.target.value;
      renderHeroes();
    }, 150));
  }

  // ล้างการค้นหา
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

  // ปุ่มเปิด Modal ต่างๆ
  const addTeamBtn = document.getElementById('add-team-btn');
  if (addTeamBtn) {
    addTeamBtn.addEventListener('click', () => openTeamModal('add'));
  }

  const overviewBtn = document.getElementById('overview-btn');
  if (overviewBtn) {
    overviewBtn.addEventListener('click', openOverviewModal);
  }

  const closeOverviewBtn = document.getElementById('close-overview-btn');
  if (closeOverviewBtn) {
    closeOverviewBtn.addEventListener('click', closeOverviewModal);
  }

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', showResetModal);
  }

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
});
