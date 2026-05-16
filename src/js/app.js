import { socket, initSocketListeners, syncState, syncTableStatus, notifyOrderReady } from '../services/socket.service.js';
import { initClock, toast, isMobile, closeModal, openModal } from '../utils/helpers.js';

// ══ GLOBALS ════════════════════════════════════════════
let STAFF = [];
let MENU = [];
let INVENTORY = [];
let TABLES = [];
let tableStatus = {};
let bills = [];
let kots = [];
let onlineOrders = [];
let deductionLog = [];

let currentStaff = null;
let pinBuffer = '';
let pinTarget = null;
let shiftStart = null;
let menuIdSeq = 1;
let billSeq = 1;
let kotSeq = 1;

let currentTable = '';
let currentOrder = {};
let discount = { type: 'none', value: 0 };
let activeCat = 'All';
let searchQ = '';
let olTab = 'all';
let editItemId = null;

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
  initClock();
  initSocketListeners({
    onInitialState,
    onStateUpdated,
    onTableStatusUpdated,
    onOrderReady
  });
  
  // Attach global functions to window for HTML onclick handlers
  window.selectStaff = selectStaff;
  window.pinPress = pinPress;
  window.pinBack = pinBack;
  window.pinSubmit = pinSubmit;
  window.showPage = showPage;
  window.filterMenu = filterMenu;
  window.setCat = setCat;
  window.addItem = addItem;
  window.changeQty = changeQty;
  window.removeItem = removeItem;
  window.clearOrder = clearOrder;
  window.applyDiscount = applyDiscount;
  window.sendKOT = sendKOT;
  window.openReceiptModal = openReceiptModal;
  window.finalizeBill = finalizeBill;
  window.markPaidFromOrder = markPaidFromOrder;
  window.markPaidReport = markPaidReport;
  window.logoutConfirm = logoutConfirm;
  window.endShift = endShift;
  window.closeModal = closeModal;
  window.kotReady = kotReady;
  window.kotVoid = kotVoid;
  window.setOlTab = setOlTab;
  window.olAction = olAction;
  window.quickRestock = quickRestock;
  window.deductStock = deductStock;
  window.openRestockAll = openRestockAll;
  window.applyRestock = applyRestock;
  window.toggleMenuItem = toggleMenuItem;
  window.openAddItemModal = openAddItemModal;
  window.saveMenuItem = saveMenuItem;
  window.cancelMenuEdit = cancelMenuEdit;
  window.openEditItem = openEditItem;
  window.saveEditItem = saveEditItem;
  window.deleteMenuItem = deleteMenuItem;
  window.renderReports = renderReports;
  window.downloadShiftReport = downloadShiftReport;
  window.loadTable = loadTable;
  window.mobNav = mobNav;
  window.toggleMobMore = toggleMobMore;
  window.closeMobMore = closeMobMore;
  window.setMobOrderTab = setMobOrderTab;
});

// ══ SOCKET CALLBACKS ════════════════════════════════════
function onInitialState(state) {
  STAFF = state.STAFF || [];
  MENU = state.MENU || [];
  INVENTORY = state.INVENTORY || [];
  TABLES = state.TABLES || [];
  tableStatus = state.tableStatus || {};
  bills = state.bills || [];
  kots = state.kots || [];
  onlineOrders = state.onlineOrders || [];
  deductionLog = state.deductionLog || [];

  menuIdSeq = (MENU.length > 0 ? Math.max(...MENU.map(m => m.id)) : 0) + 1;
  billSeq = bills.length > 0 ? Math.max(...bills.map(b => parseInt(b.id.split('-')[1]))) + 1 : 1;
  kotSeq = kots.length > 0 ? Math.max(...kots.map(k => parseInt(k.id.split('-')[1]))) + 1 : 1;

  renderStaffGrid();
  if (currentStaff) refreshUI();
}

function onStateUpdated(key, data) {
  if (key === 'MENU') { MENU = data; renderMenu(); renderMenuEditor(); }
  if (key === 'INVENTORY') { INVENTORY = data; renderInventory(); }
  if (key === 'bills') { bills = data; renderReports(); }
  if (key === 'kots') { kots = data; renderKot(); }
  if (key === 'onlineOrders') { onlineOrders = data; renderOnline(); }
  if (key === 'deductionLog') { deductionLog = data; renderInventory(); }
}

function onTableStatusUpdated(tid, data) {
  tableStatus[tid] = data;
  if (isPageActive('counter')) renderCounter();
  if (currentTable === tid) {
    currentOrder = data.order || {};
    renderOrderPanel();
  }
}

function onOrderReady(msg) {
  toast(msg, 'success');
  try {
    new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
  } catch (e) {}
}

// ══ UI REFRESH ══════════════════════════════════════════
function refreshUI() {
  if (isPageActive('counter')) renderCounter();
  if (isPageActive('order') && currentTable) {
    if (tableStatus[currentTable]) {
      currentOrder = tableStatus[currentTable].order || {};
      renderOrderPanel();
    }
  }
  renderKot();
  renderOnline();
  renderInventory();
  renderMenuEditor();
  renderMenu();
  renderReports();
}

function isPageActive(p) {
  const pg = document.getElementById('page-' + p);
  return pg && pg.classList.contains('active');
}

// ══ LOGIN LOGIC ═════════════════════════════════════════
function renderStaffGrid() {
  const grid = document.getElementById('staffGrid');
  if (!grid) return;
  grid.innerHTML = STAFF.map(s => `
    <div class="staff-card" onclick="selectStaff('${s.id}')">
      <div class="staff-avatar" style="background:${s.color}20;border:2px solid ${s.color}40">${s.emoji}</div>
      <div class="staff-name">${s.name}</div>
      <div class="staff-role">${s.role}</div>
    </div>`).join('');
}

function selectStaff(id) {
  pinTarget = STAFF.find(s => s.id === id);
  pinBuffer = '';
  document.getElementById('pinName').textContent = pinTarget.emoji + ' ' + pinTarget.name;
  document.getElementById('pinDisplay').textContent = '_ _ _ _';
  document.getElementById('pinErr').textContent = '';
  document.getElementById('staffGrid').style.display = 'none';
  document.getElementById('pinModal').style.display = 'block';
}

function pinPress(d) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += d;
  updatePinDisplay();
}

function pinBack() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDisplay();
}

function updatePinDisplay() {
  document.getElementById('pinDisplay').textContent = ('●'.repeat(pinBuffer.length) + '_'.repeat(4 - pinBuffer.length)).split('').join(' ');
}

function pinSubmit() {
  if (pinBuffer === pinTarget.pin) {
    loginSuccess();
  } else {
    document.getElementById('pinErr').textContent = 'Incorrect PIN. Try again.';
    pinBuffer = '';
    updatePinDisplay();
  }
}

function loginSuccess() {
  currentStaff = pinTarget;
  shiftStart = new Date();
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appSidebar').style.display = 'flex';
  document.getElementById('appMain').style.display = 'flex';
  document.getElementById('userName').textContent = currentStaff.name.split(' ')[0];
  document.getElementById('userAv').textContent = currentStaff.emoji;
  document.getElementById('userAv').style.background = currentStaff.color;
  document.getElementById('sidebarUser').textContent = currentStaff.emoji;
  document.getElementById('sidebarUser').style.background = currentStaff.color + '33';
  
  populateTableSelect();
  renderCats();
  renderMenu();
  renderMenuEditor();
  
  if (isMobile()) {
    document.getElementById('mobileNav').style.display = 'flex';
    setTimeout(() => setMobOrderTab('menu'), 100);
  }
  
  applyRBAC(currentStaff);
  toast('Welcome, ' + currentStaff.name + '! 👋', 'success');
}

function logoutConfirm() {
  if (confirm('End session and logout?')) {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appSidebar').style.display = 'none';
    document.getElementById('appMain').style.display = 'none';
    document.getElementById('mobileNav').style.display = 'none';
    currentStaff = null;
    document.getElementById('pinModal').style.display = 'none';
    document.getElementById('staffGrid').style.display = 'grid';
  }
}

function applyRBAC(staff) {
  const tabs = ['order', 'counter', 'kot', 'online', 'inventory', 'menu', 'reports'];
  let allowed = [];
  if (staff.access === 'all') allowed = tabs;
  else if (staff.access === 'kitchen') allowed = ['kot', 'inventory', 'online'];
  else if (staff.access === 'billing') allowed = ['reports', 'counter'];
  else if (staff.access === 'order') allowed = ['order', 'counter'];

  tabs.forEach(t => {
    const db = document.getElementById('nb-' + t);
    if (db) db.style.display = allowed.includes(t) ? 'flex' : 'none';
    const mb = document.getElementById('mn-' + t);
    if (mb) mb.style.display = allowed.includes(t) ? 'flex' : 'none';
  });

  const mnMore = document.getElementById('mn-more');
  const moreTabs = ['inventory', 'menu', 'reports'];
  const showMore = allowed.some(t => moreTabs.includes(t));
  if (mnMore) mnMore.style.display = showMore ? 'flex' : 'none';

  if (allowed.length > 0) {
    if (isMobile()) {
      mobNav(allowed[0], document.getElementById('mn-' + allowed[0]));
    } else {
      showPage(allowed[0]);
    }
  }
}

// ══ NAVIGATION ═══════════════════════════════════════════
const pgMeta = {
  order: { t: 'New Order', s: 'Take orders, send KOT, generate bills' },
  counter: { t: 'Counter / Tables', s: 'Live table status overview' },
  kot: { t: 'Kitchen KOT', s: 'Monitor kitchen order tickets' },
  online: { t: 'Online Orders', s: 'Swiggy & Zomato orders' },
  inventory: { t: 'Inventory', s: 'Stock levels and deductions' },
  menu: { t: 'Menu Editor', s: 'Add, edit, toggle menu items' },
  reports: { t: 'Reports & Bills', s: 'Sales reports and shift data' }
};

function showPage(p) {
  document.querySelectorAll('.page,.page-scroll').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(e => e.classList.remove('active'));
  
  const pg = document.getElementById('page-' + p);
  if (pg) pg.classList.add('active');
  
  const btn = document.getElementById('nb-' + p);
  if (btn) btn.classList.add('active');
  
  document.getElementById('pageTitle').textContent = pgMeta[p].t;
  document.getElementById('pageSubtitle').textContent = pgMeta[p].s;
  
  if (p === 'counter') renderCounter();
  if (p === 'reports') renderReports();
  if (p === 'kot') renderKot();
  if (p === 'online') renderOnline();
  if (p === 'inventory') renderInventory();
  if (p === 'menu') renderMenuEditor();
}

// ══ ORDER & MENU ════════════════════════════════════════
function renderCats() {
  const cats = ['All', ...new Set(MENU.map(i => i.cat))];
  document.getElementById('catPills').innerHTML = cats.map(c => `
    <div class="cat-pill ${c === activeCat ? 'active' : ''}" onclick="setCat('${c}')">${c}</div>
  `).join('');
}

function setCat(c) {
  activeCat = c;
  renderCats();
  renderMenu();
}

function filterMenu(q) {
  searchQ = q;
  renderMenu();
}

function renderMenu() {
  let items = MENU.filter(i => i.active);
  if (activeCat !== 'All') items = items.filter(i => i.cat === activeCat);
  if (searchQ) items = items.filter(i => i.name.toLowerCase().includes(searchQ.toLowerCase()) || i.code.toLowerCase().includes(searchQ.toLowerCase()));
  
  const grid = document.getElementById('menuGrid');
  if (!grid) return;
  
  grid.innerHTML = items.map(i => `
    <div class="menu-card" onclick="addItem(${i.id})">
      <div class="mc-cat"><span class="vd ${i.veg ? 'v' : 'n'}"></span>${i.cat}</div>
      <div class="mc-name">${i.name}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="mc-price">₹${i.price}</div>
        <div style="font-size:10px;color:var(--muted);font-family:'DM Mono',monospace">${i.code}</div>
      </div>
    </div>`).join('') || '<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0">No active items found</div>';
}

function addItem(id) {
  if (!currentTable) { toast('Select a table first', 'error'); return; }
  const item = MENU.find(i => i.id === id);
  if (!item) return;
  
  if (currentOrder[id]) currentOrder[id].qty++;
  else currentOrder[id] = { ...item, qty: 1 };
  
  updateTableOrder();
  toast('+ ' + item.name);
}

function changeQty(id, d) {
  if (!currentOrder[id]) return;
  currentOrder[id].qty += d;
  if (currentOrder[id].qty <= 0) delete currentOrder[id];
  updateTableOrder();
}

function removeItem(id) {
  delete currentOrder[id];
  updateTableOrder();
}

function clearOrder() {
  currentOrder = {};
  discount = { type: 'none', value: 0 };
  updateTableOrder();
}

function updateTableOrder() {
  if (currentTable) {
    tableStatus[currentTable].order = currentOrder;
    syncTableStatus(currentTable, tableStatus[currentTable]);
  }
  renderOrderPanel();
}

function renderOrderPanel() {
  const keys = Object.keys(currentOrder);
  const ob = document.getElementById('orderBody');
  if (!ob) return;

  if (!keys.length) {
    ob.innerHTML = '<div class="empty-bill"><div class="icon">🛒</div><div>Add items from the menu</div></div>';
    ['discountRow', 'totalsBlock', 'billActions'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    return;
  }

  ob.innerHTML = '<div style="flex:1;overflow-y:auto">' + keys.map(id => {
    const it = currentOrder[id];
    return `<div class="order-item"><div class="oi-name">${it.name}</div>
      <div style="display:flex;align-items:center;gap:4px">
        <div class="qb" onclick="changeQty(${id},-1)">−</div><div class="qn">${it.qty}</div><div class="qb" onclick="changeQty(${id},1)">+</div>
      </div>
      <div class="oi-price">₹${it.price * it.qty}</div>
      <button class="del" onclick="removeItem(${id})">×</button>
    </div>`;
  }).join('') + '</div>';

  document.getElementById('discountRow').style.display = 'flex';
  document.getElementById('totalsBlock').style.display = 'block';
  document.getElementById('billActions').style.display = 'block';

  const totals = calcTotals();
  document.getElementById('t-sub').textContent = '₹' + totals.sub;
  document.getElementById('t-cgst').textContent = '₹' + totals.cgst.toFixed(2);
  document.getElementById('t-sgst').textContent = '₹' + totals.sgst.toFixed(2);
  document.getElementById('t-grand').textContent = '₹' + totals.grand;
  
  const dr = document.getElementById('t-disc-row');
  if (totals.disc > 0) {
    dr.style.display = 'flex';
    document.getElementById('t-disc').textContent = '-₹' + totals.disc;
  } else {
    dr.style.display = 'none';
  }

  if (currentTable) {
    const ts = tableStatus[currentTable];
    ts.amount = totals.grand;
    ts.items = Object.values(currentOrder).reduce((a, i) => a + i.qty, 0);
    if (ts.items > 0 && ts.status === 'free') ts.status = 'occupied';
    syncTableStatus(currentTable, ts);
  }
  updateMobCartBadge();
}

function calcTotals() {
  const sub = Object.values(currentOrder).reduce((a, i) => a + i.price * i.qty, 0);
  let disc = 0;
  if (discount.type === 'pct') disc = Math.round(sub * discount.value / 100);
  else if (discount.type === 'flat') disc = Math.min(discount.value, sub);
  
  const taxable = sub - disc;
  const cgst = Math.round(taxable * 0.025 * 100) / 100;
  const sgst = Math.round(taxable * 0.025 * 100) / 100;
  const grand = Math.round(taxable + cgst + sgst);
  return { sub, disc, cgst, sgst, grand };
}

function applyDiscount() {
  const val = parseFloat(document.getElementById('discountVal').value) || 0;
  const type = document.getElementById('discountType').value;
  discount = (val <= 0) ? { type: 'none', value: 0 } : { type, value: val };
  renderOrderPanel();
  if (val > 0) toast('Discount applied ✓');
}

// ══ COUNTER ══════════════════════════════════════════════
function populateTableSelect() {
  const sel = document.getElementById('tableSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Select Table --</option>' +
    TABLES.map(t => `<option value="${t.id}">${t.label} (${t.type})</option>`).join('');
}

function loadTable(tid) {
  if (!tid) {
    currentTable = '';
    currentOrder = {};
    discount = { type: 'none', value: 0 };
    renderOrderPanel();
    return;
  }
  currentTable = tid;
  currentOrder = { ...tableStatus[tid].order };
  discount = { type: 'none', value: 0 };
  renderOrderPanel();
}

function renderCounter() {
  const grid = document.getElementById('counterGrid');
  if (!grid) return;
  grid.innerHTML = TABLES.map(t => {
    const s = tableStatus[t.id];
    const cls = s.status;
    return `
      <div class="table-card ${cls}" onclick="tableCardClick('${t.id}')">
        <div class="tc-badge ${cls}"></div>
        <div class="tc-num">${t.label}</div>
        <div class="tc-type">${t.type} · ${t.seats} seats</div>
        <div class="tc-status ${cls === 'occupied' ? 'occ' : cls === 'reserved' ? 'res' : 'free'}">
          ${cls === 'occupied' ? 'Occupied' : cls === 'reserved' ? 'Reserved' : 'Available'}
        </div>
        ${s.status === 'occupied' ? `<div class="tc-amount">₹${s.amount}</div><div class="tc-time">Since ${s.since || '--'} · ${s.items} item(s)</div>` : ''}
        ${s.status === 'free' ? `<div class="tc-time" style="margin-top:8px;color:var(--green)">Ready for guests</div>` : ''}
      </div>`;
  }).join('');
}

window.tableCardClick = function(tid) {
  const s = tableStatus[tid];
  const tbl = TABLES.find(t => t.id === tid);
  if (s.status === 'occupied') {
    if (confirm(`Clear ${tbl.label}?\nMark pending bill as paid and free the table.`)) {
      const p = bills.find(b => b.table === tbl.label && b.status === 'pending');
      if (p) { p.status = 'paid'; syncState('bills', bills); }
      tableStatus[tid] = { status: 'free', amount: 0, items: 0, since: null, order: {} };
      syncTableStatus(tid, tableStatus[tid]);
      if (currentTable === tid) clearOrder();
      renderCounter();
      toast(tbl.label + ' cleared ✓', 'success');
    }
  } else {
    const sel = document.getElementById('tableSelect');
    if (sel) sel.value = tid;
    loadTable(tid);
    showPage('order');
  }
};

// ══ KOT ════════════════════════════════════════════════
function renderKot() {
  const el = document.getElementById('kotGrid');
  if (!el) return;
  document.getElementById('kotCount').textContent = kots.length + ' active';
  if (!kots.length) {
    el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:20px 0">No active kitchen tickets — all done! 🎉</div>';
    return;
  }
  el.innerHTML = kots.map((k, i) => `
    <div class="kot-card ${k.urgent ? 'urgent' : ''}">
      <div class="kot-head">
        <div class="kot-table">${k.table} <span style="font-size:11px;color:var(--muted);font-weight:400">${k.id}</span></div>
        <div style="display:flex;gap:6px;align-items:center">${k.urgent ? '<span class="urgent-tag">URGENT</span>' : ''}<div class="kot-time">${k.time}</div></div>
      </div>
      <div>${k.items.map(it => `<div class="kot-item"><span>${it.n}</span><span style="font-weight:700">×${it.q}</span></div>`).join('')}</div>
      <div class="kot-action">
        <button class="ready-btn" onclick="kotReady(${i})">Mark Ready ✓</button>
        <button class="void-btn" onclick="kotVoid(${i})">✕</button>
      </div>
    </div>`).join('');
}

function sendKOT() {
  if (!Object.keys(currentOrder).length) { toast('No items to send', 'error'); return; }
  if (!currentTable) { toast('Select a table first', 'error'); return; }
  
  const tbl = TABLES.find(t => t.id === currentTable);
  const newKot = {
    id: 'K-00' + kotSeq++,
    table: tbl ? tbl.label : currentTable,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    items: Object.values(currentOrder).map(i => ({ n: i.name, q: i.qty })),
    urgent: false
  };
  
  kots.push(newKot);
  syncState('kots', kots);
  
  tableStatus[currentTable].status = 'occupied';
  syncTableStatus(currentTable, tableStatus[currentTable]);
  
  // Log deductions
  Object.values(currentOrder).forEach(i => {
    const entry = { item: i.name, reason: i.name + ' ×' + i.qty, qty: 'auto', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    deductionLog.unshift(entry);
  });
  syncState('deductionLog', deductionLog);
  
  toast('KOT sent to kitchen! 🍳', 'success');
}

function kotReady(i) {
  const k = kots[i];
  if (k) notifyOrderReady(`Order for ${k.table} is ready! 🍽️`);
  kots.splice(i, 1);
  syncState('kots', kots);
  toast('KOT marked as ready!', 'success');
  renderKot();
}

function kotVoid(i) {
  if (confirm('Void this KOT?')) {
    kots.splice(i, 1);
    syncState('kots', kots);
    toast('KOT voided');
    renderKot();
  }
}

// ══ BILLING ══════════════════════════════════════════════
function openReceiptModal() {
  if (!Object.keys(currentOrder).length) { toast('No items', 'error'); return; }
  const tbl = TABLES.find(t => t.id === currentTable) || { label: currentTable };
  const totals = calcTotals();
  const now = new Date();
  const lines = [
    '      GRAND PALACE HOTEL',
    '    Restaurant & Room Service',
    '   MG Road, Ahmedabad - 380001',
    '=================================',
    `Bill No : B-${String(billSeq).padStart(4, '0')}`,
    `Table   : ${tbl.label}`,
    `Date    : ${now.toLocaleDateString('en-IN')}`,
    `Time    : ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
    `Cashier : ${currentStaff ? currentStaff.name : 'Admin'}`,
    '=================================',
    'Item              Qty     Amt  ',
    '---------------------------------',
    ...Object.values(currentOrder).map(i => {
      const nm = i.name.substring(0, 16).padEnd(16, ' ');
      return `${nm}  ×${i.qty}   ₹${String(i.price * i.qty).padStart(5, ' ')}`;
    }),
    '---------------------------------',
    `${'Subtotal'.padEnd(23, ' ')}₹${String(totals.sub).padStart(5, ' ')}`,
    ...(totals.disc > 0 ? [`${'Discount'.padEnd(23, ' ')}-₹${String(totals.disc).padStart(4, ' ')}`] : []),
    `${'CGST @2.5%'.padEnd(23, ' ')}₹${totals.cgst.toFixed(2).padStart(5, ' ')}`,
    `${'SGST @2.5%'.padEnd(23, ' ')}₹${totals.sgst.toFixed(2).padStart(5, ' ')}`,
    '=================================',
    `${'GRAND TOTAL'.padEnd(23, ' ')}₹${String(totals.grand).padStart(5, ' ')}`,
    '=================================',
    '',
    '     Thank you! Visit again.',
  ].join('\n');
  
  document.getElementById('receiptContent').textContent = lines;
  openModal('receiptModal');
}

function finalizeBill() {
  const tbl = TABLES.find(t => t.id === currentTable) || { label: currentTable };
  const totals = calcTotals();
  const bill = {
    id: 'B-' + String(billSeq++).padStart(4, '0'),
    table: tbl.label,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    items: Object.values(currentOrder).reduce((a, i) => a + i.qty, 0),
    amount: totals.grand,
    status: 'pending',
    staff: currentStaff ? currentStaff.name : 'Admin'
  };
  
  bills.unshift(bill);
  syncState('bills', bills);
  
  tableStatus[currentTable].since = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  syncTableStatus(currentTable, tableStatus[currentTable]);
  
  closeModal('receiptModal');
  toast('Bill saved! Collect payment.', 'success');
}

function markPaidFromOrder() {
  if (!Object.keys(currentOrder).length) { toast('No order to settle', 'error'); return; }
  const tbl = TABLES.find(t => t.id === currentTable) || { label: currentTable };
  const pending = bills.find(b => b.table === tbl.label && b.status === 'pending');
  if (pending) { pending.status = 'paid'; syncState('bills', bills); }
  
  tableStatus[currentTable] = { status: 'free', amount: 0, items: 0, since: null, order: {} };
  syncTableStatus(currentTable, tableStatus[currentTable]);
  clearOrder();
  toast('Payment collected. Table cleared! ✓', 'success');
}

function markPaidReport(id) {
  const b = bills.find(x => x.id === id);
  if (!b) return;
  b.status = 'paid';
  syncState('bills', bills);
  
  const tbl = TABLES.find(t => t.label === b.table);
  if (tbl) {
    tableStatus[tbl.id] = { status: 'free', amount: 0, items: 0, since: null, order: {} };
    syncTableStatus(tbl.id, tableStatus[tbl.id]);
  }
  renderReports();
  toast('Payment received for ' + b.table, 'success');
}

// ══ REPORTS ══════════════════════════════════════════════
function renderReports() {
  const paid = bills.filter(b => b.status === 'paid');
  const pending = bills.filter(b => b.status === 'pending');
  const voided = bills.filter(b => b.status === 'void');
  
  document.getElementById('r-revenue').textContent = '₹' + paid.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN');
  document.getElementById('r-bills').textContent = bills.length;
  document.getElementById('r-pending').textContent = pending.length;
  document.getElementById('r-void').textContent = voided.length;
  
  const list = document.getElementById('billsList');
  if (!list) return;
  
  list.innerHTML = bills.map(b => `
    <div class="bt-row">
      <div style="font-family:'DM Mono',monospace;font-size:11px">${b.id}</div>
      <div style="font-weight:600">${b.table}</div>
      <div style="color:var(--muted)">${b.time}</div>
      <div style="color:var(--muted)">${b.items}</div>
      <div style="font-weight:800">₹${b.amount.toLocaleString('en-IN')}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="status-pill ${b.status === 'paid' ? 'sp-paid' : b.status === 'void' ? 'sp-void' : 'sp-pending'}">${b.status}</span>
        ${b.status === 'pending' ? `<button class="pay-btn-sm" onclick="markPaidReport('${b.id}')">Pay</button>` : ''}
      </div>
    </div>`).join('');
}

function downloadShiftReport() {
  const now = new Date();
  const paid = bills.filter(b => b.status === 'paid');
  const totalRev = paid.reduce((a, b) => a + b.amount, 0);
  const staffName = currentStaff ? currentStaff.name : 'Admin';
  
  // Simple HTML report generation (for brevity, keeping it similar to original but cleaned)
  const reportHtml = `
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Grand Palace Hotel — Shift Report</h2>
        <p>Date: ${now.toLocaleDateString()}</p>
        <p>Staff: ${staffName}</p>
        <p>Total Revenue: ₹${totalRev}</p>
        <p>Total Bills: ${bills.length}</p>
        <hr/>
        <h3>Bill Details</h3>
        <table border="1" width="100%" cellpadding="5" style="border-collapse: collapse;">
          <thead><tr><th>ID</th><th>Table</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            ${bills.map(b => `<tr><td>${b.id}</td><td>${b.table}</td><td>₹${b.amount}</td><td>${b.status}</td></tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  const blob = new Blob([reportHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shift-report-${now.toISOString().split('T')[0]}.html`;
  a.click();
  toast('Shift report generated!', 'success');
}

function endShift() {
  if (confirm('End current shift and generate shift report?')) {
    downloadShiftReport();
  }
}

// ══ MOBILE HELPERS ═══════════════════════════════════════
function mobNav(p, el) {
  document.querySelectorAll('.mob-nav-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  showPage(p);
}

function toggleMobMore() {
  const mm = document.getElementById('moreMenu');
  mm.style.display = mm.style.display === 'none' ? 'grid' : 'none';
}

function closeMobMore() {
  document.getElementById('moreMenu').style.display = 'none';
}

function setMobOrderTab(tab) {
  const isMenu = tab === 'menu';
  document.getElementById('mobt-menu').classList.toggle('active', isMenu);
  document.getElementById('mobt-bill').classList.toggle('active', !isMenu);
  document.getElementById('menuPanelEl').classList.toggle('mob-hidden', !isMenu);
  document.getElementById('billPanelEl').classList.toggle('mob-hidden', isMenu);
}

function updateMobCartBadge() {
  const count = Object.values(currentOrder).reduce((a, i) => a + i.qty, 0);
  const bc = document.getElementById('mobBillCount');
  if (bc) { bc.textContent = count; bc.style.display = count > 0 ? 'inline' : 'none'; }
  const cb = document.getElementById('cartBadge');
  if (cb) { cb.textContent = count; cb.style.display = count > 0 ? 'flex' : 'none'; }
}

// ══ ONLINE ORDERS ════════════════════════════════════════
function setOlTab(tab, el) {
  olTab = tab;
  document.querySelectorAll('.ol-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderOnline();
}

function renderOnline() {
  const filtered = olTab === 'all' ? onlineOrders : onlineOrders.filter(o => o.platform === olTab);
  const list = document.getElementById('onlineOrdersList');
  if (!list) return;

  const icons = { swiggy: '🟠', zomato: '🔴', direct: '🔵' };
  const pbcls = { swiggy: 'pb-swiggy', zomato: 'pb-zomato', direct: 'pb-direct' };

  list.innerHTML = filtered.map((o, i) => `
    <div class="online-order-card">
      <div class="ooc-platform" style="background:${o.platform === 'swiggy' ? '#FFF7ED' : o.platform === 'zomato' ? '#FFF1F2' : '#EFF6FF'}">${icons[o.platform]}</div>
      <div class="ooc-info">
        <div class="ooc-id">${o.id} · ${o.time}</div>
        <div class="ooc-items" style="margin-top:4px">${o.items}</div>
        <div class="ooc-addr">${o.customer}</div>
        <div class="ooc-meta">
          <span class="platform-badge ${pbcls[o.platform]}">${o.platform}</span>
          <span class="ooc-tag">${o.status}</span>
        </div>
      </div>
      <div class="ooc-amount">₹${o.amount}</div>
      <div class="ooc-actions">
        ${o.status === 'new' ? `<button class="ooc-btn acc" onclick="olAction(${i},'preparing')">Accept</button>` : ''}
        ${o.status === 'preparing' ? `<button class="ooc-btn ready" onclick="olAction(${i},'ready')">Mark Ready</button>` : ''}
        ${o.status === 'ready' ? `<button class="ooc-btn done" onclick="olAction(${i},'delivered')">Done</button>` : ''}
      </div>
    </div>`).join('') || '<div style="color:var(--muted);text-align:center;padding:30px">No orders found</div>';
}

function olAction(i, status) {
  const filtered = olTab === 'all' ? onlineOrders : onlineOrders.filter(o => o.platform === olTab);
  const order = filtered[i];
  const realIdx = onlineOrders.indexOf(order);
  if (realIdx > -1) {
    onlineOrders[realIdx].status = status;
    syncState('onlineOrders', onlineOrders);
    if (status === 'ready') notifyOrderReady(`Online Order ${order.id} is ready! 📦`);
  }
  renderOnline();
}

// ══ INVENTORY ════════════════════════════════════════════
function renderInventory() {
  const grid = document.getElementById('invGrid');
  if (!grid) return;
  grid.innerHTML = INVENTORY.map(inv => {
    const pct = Math.round((inv.stock / inv.max) * 100);
    const level = inv.stock === 0 ? 'out' : inv.stock <= inv.min ? 'low' : 'ok';
    return `
      <div class="inv-card ${level}">
        <div class="inv-name">${inv.name} <span style="font-size:10px;color:var(--muted)">(${inv.unit})</span></div>
        <div class="inv-bar-wrap"><div class="inv-bar ${level}" style="width:${pct}%"></div></div>
        <div class="inv-nums"><span>${inv.stock} ${inv.unit}</span><span>Max: ${inv.max}</span></div>
        <div class="inv-actions">
          <button class="inv-btn restock" onclick="quickRestock('${inv.id}')">+ Restock</button>
        </div>
      </div>`;
  }).join('');
}

function quickRestock(id) {
  const inv = INVENTORY.find(i => i.id === id);
  if (!inv) return;
  const qty = prompt(`Restock ${inv.name} (${inv.unit}):`);
  if (qty && !isNaN(qty)) {
    inv.stock = Math.min(inv.stock + parseFloat(qty), inv.max);
    syncState('INVENTORY', INVENTORY);
    renderInventory();
    toast('Restocked!');
  }
}

function deductStock(id) {
  const inv = INVENTORY.find(i => i.id === id);
  if (!inv) return;
  const qty = prompt(`Deduct ${inv.name} (${inv.unit}):`);
  if (qty && !isNaN(qty)) {
    inv.stock = Math.max(0, inv.stock - parseFloat(qty));
    syncState('INVENTORY', INVENTORY);
    renderInventory();
    toast('Stock deducted');
  }
}

function openRestockAll() {
  openModal('restockModal');
  const list = document.getElementById('restockList');
  list.innerHTML = INVENTORY.map(inv => `
    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee">
      <span>${inv.name}</span>
      <input type="number" id="rs-${inv.id}" style="width:60px" placeholder="0"/>
    </div>
  `).join('');
}

function applyRestock() {
  INVENTORY.forEach(inv => {
    const val = parseFloat(document.getElementById('rs-' + inv.id).value) || 0;
    inv.stock = Math.min(inv.stock + val, inv.max);
  });
  syncState('INVENTORY', INVENTORY);
  closeModal('restockModal');
  renderInventory();
  toast('Inventory updated');
}

// ══ MENU EDITOR ══════════════════════════════════════════
function renderMenuEditor() {
  const grid = document.getElementById('menuEditorGrid');
  if (!grid) return;
  grid.innerHTML = MENU.map(i => `
    <div class="me-card ${i.active ? '' : 'inactive'}">
      <div class="toggle-switch ${i.active ? 'on' : ''}" onclick="toggleMenuItem(${i.id})"></div>
      <div class="me-name">${i.name}</div>
      <div class="me-price">₹${i.price}</div>
      <div class="me-actions">
        <button class="me-btn edit" onclick="openEditItem(${i.id})">Edit</button>
        <button class="me-btn del" onclick="deleteMenuItem(${i.id})">Delete</button>
      </div>
    </div>`).join('');
}

function toggleMenuItem(id) {
  const item = MENU.find(i => i.id === id);
  if (item) {
    item.active = !item.active;
    syncState('MENU', MENU);
    renderMenuEditor();
    renderMenu();
  }
}

function openAddItemModal() {
  editItemId = null;
  document.getElementById('addItemForm').style.display = 'block';
}

function cancelMenuEdit() {
  document.getElementById('addItemForm').style.display = 'none';
}

function saveMenuItem() {
  const name = document.getElementById('fi-name').value;
  const price = parseFloat(document.getElementById('fi-price').value);
  if (!name || !price) return;
  
  if (editItemId) {
    const item = MENU.find(i => i.id === editItemId);
    if (item) Object.assign(item, { name, price });
  } else {
    MENU.push({ id: menuIdSeq++, name, price, cat: 'Main Course', active: true, veg: true, code: 'NEW' });
  }
  syncState('MENU', MENU);
  cancelMenuEdit();
  renderMenuEditor();
  renderMenu();
}

function openEditItem(id) {
  const item = MENU.find(i => i.id === id);
  if (!item) return;
  editItemId = id;
  document.getElementById('ei-name').value = item.name;
  document.getElementById('ei-price').value = item.price;
  openModal('editItemModal');
}

function saveEditItem() {
  const item = MENU.find(i => i.id === editItemId);
  if (item) {
    item.name = document.getElementById('ei-name').value;
    item.price = parseFloat(document.getElementById('ei-price').value);
    syncState('MENU', MENU);
  }
  closeModal('editItemModal');
  renderMenuEditor();
  renderMenu();
}

function deleteMenuItem(id) {
  if (confirm('Delete item?')) {
    MENU = MENU.filter(i => i.id !== id);
    syncState('MENU', MENU);
    renderMenuEditor();
    renderMenu();
  }
}
