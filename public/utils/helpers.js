/**
 * Global Helper Utilities
 */

// Clock functionality
export function initClock() {
  function tick() {
    const n = new Date();
    const clockEl = document.getElementById('clock');
    if (clockEl) {
      clockEl.textContent = n.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }
  }
  setInterval(tick, 1000);
  tick();
}

// Toast Notifications
export function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Device detection
export function isMobile() {
  return window.innerWidth <= 640;
}

// Modal controls
export function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

export function openModal(id) {
  document.getElementById(id).classList.add('show');
}
