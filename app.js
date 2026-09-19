/**
 * ROV Hero Tracker — Application Logic
 * ค้นหา กรอง เลือก ฮีโร่ที่เล่นไปแล้ว
 * ตัวที่ติ๊กแล้วจะขึ้นไปอยู่ด้านบนเสมอ จัดเรียง A-Z สวยงาม
 * แอนิเมชันแยกเฉพาะตัวที่กดติ๊ก ไม่รันพร้อมกันทุกตัว
 */

// ─── State ───
const LOCAL_STORAGE_KEY = 'rov_played_heroes';
let playedHeroes = new Set();
let currentSearch = '';
let currentRole = 'all';
let currentStatus = 'all';

// ─── LocalStorage ───
function loadPlayedHeroes() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        playedHeroes = new Set(parsed);
      }
    }
  } catch (e) {
    console.error('โหลดข้อมูลไม่สำเร็จ:', e);
  }
}

function savePlayedHeroes() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...playedHeroes]));
  } catch (e) {
    console.error('บันทึกข้อมูลไม่สำเร็จ:', e);
  }
}

// ─── Toggle Hero (พร้อม FLIP Reorder & Isolated Animation) ───
function toggleHero(id) {
  const isNowPlayed = !playedHeroes.has(id);
  if (isNowPlayed) {
    playedHeroes.add(id);
  } else {
    playedHeroes.delete(id);
  }
  savePlayedHeroes();

  // รันแอนิเมชันเฉพาะตัวที่กด + เลื่อนตำแหน่งอย่างนุ่มนวล
  renderWithAnimation(id, isNowPlayed);
}

// ─── Debounce ───
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ─── Progress Update ───
function updateProgress() {
  const total = HEROES.length;
  const played = playedHeroes.size;
  const pct = total === 0 ? 0 : Math.round((played / total) * 100);

  const statsEl = document.getElementById('stats');
  const fillEl = document.getElementById('progress-fill');
  const barEl = fillEl ? fillEl.parentElement : null;

  if (statsEl) {
    statsEl.textContent = `เล่นไปแล้ว ${played} / ${total} ตัว (${pct}%)`;
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
    // สถานะ
    const isPlayed = playedHeroes.has(hero.id);
    if (currentStatus === 'played' && !isPlayed) return false;
    if (currentStatus === 'unplayed' && isPlayed) return false;

    return true;
  });

  // 2. จัดเรียง: ตัวที่ถูกติ๊ก (เล่นแล้ว) ขึ้นไปอยู่ตัวแรกเสมอ + เรียงตัวอักษร A-Z สวยงาม
  filtered.sort((a, b) => {
    const aPlayed = playedHeroes.has(a.id);
    const bPlayed = playedHeroes.has(b.id);

    // ถ้าดู "ทั้งหมด": ให้ตัวที่เล่นแล้วขึ้นมาก่อนตัวที่ยังไม่เล่น
    if (currentStatus === 'all') {
      if (aPlayed && !bPlayed) return -1;
      if (!aPlayed && bPlayed) return 1;
    }

    // ในแต่ละกลุ่ม (เล่นแล้ว และ ยังไม่เล่น) ให้เรียงลำดับชื่อ A-Z อย่างเป็นระเบียบ
    return a.name.localeCompare(b.name, 'th');
  });

  return filtered;
}

// ─── Render Heroes DOM ───
function renderHeroes(animatingId = null, isNowPlayed = false) {
  const grid = document.getElementById('hero-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

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
    const isPlayed = playedHeroes.has(hero.id);
    const card = document.createElement('div');

    // pop-animate จะใส่เฉพาะตัวที่เพิ่งถูกกดติ๊กเท่านั้น ไม่รันพร้อมกันทุกตัว
    const isTargetAnimating = (hero.id === animatingId && isNowPlayed);
    card.className = 'hero-card' + (isPlayed ? ' played' : '') + (isTargetAnimating ? ' pop-animate' : '');
    card.dataset.id = hero.id;
    card.setAttribute('role', 'listitem');

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

// ─── Render with FLIP Animation (การเคลื่อนย้ายตำแหน่งอย่างนุ่มนวล) ───
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

  // 2. LAST: เรนเดอร์ตำแหน่งใหม่ใน DOM (ตัวที่ถูกติ๊กจะขยับขึ้นไปอยู่ตัวแรกๆ)
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
        // วาร์ปกลับไปตำแหน่งเดิมก่อนทันที (Invert)
        card.style.transform = `translate(${dx}px, ${dy}px)`;
        card.style.transition = 'none';

        // ปล่อยให้ขยับกลับมาตำแหน่งใหม่ด้วย Animation (Play)
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

// ─── Modal ───
function showModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.style.display = '';
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }
}

function hideModal() {
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

  // Keyboard shortcut: / เพื่อ focus search
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName.toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea') {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
    // Escape ปิด modal
    if (e.key === 'Escape') {
      hideModal();
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

  // Status filter
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

  // Reset button & modal
  const resetBtn = document.getElementById('reset-btn');
  const modalConfirm = document.getElementById('modal-confirm');
  const modalCancel = document.getElementById('modal-cancel');
  const modalOverlay = document.getElementById('modal-overlay');

  if (resetBtn) resetBtn.addEventListener('click', showModal);
  if (modalCancel) modalCancel.addEventListener('click', hideModal);
  if (modalConfirm) {
    modalConfirm.addEventListener('click', () => {
      playedHeroes.clear();
      savePlayedHeroes();
      renderHeroes();
      hideModal();
    });
  }
  // คลิกนอก modal เพื่อปิด
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideModal();
    });
  }
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  // ตรวจสอบ HEROES array
  if (typeof HEROES === 'undefined' || !Array.isArray(HEROES)) {
    console.error('ไม่พบข้อมูลฮีโร่! ตรวจสอบไฟล์ heroes.js');
    window.HEROES = [];
  }

  // โหลดข้อมูลและแสดงผล
  loadPlayedHeroes();
  setupEventListeners();
  renderHeroes();
});
