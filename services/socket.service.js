/**
 * Grand Palace Hotel POS — State Service
 * Uses localStorage for Vercel/static deployment.
 * All data persists in the browser across page refreshes.
 */

const STORAGE_KEY = 'gp_pos_state_v2';

const DEFAULT_STATE = {
  STAFF: [
    {id:'admin',   name:'Raj Admin',    role:'Manager',    pin:'1234', color:'#E94560', emoji:'👨‍💼', access:'all'},
    {id:'biller1', name:'Priya Sharma', role:'Cashier',    pin:'2222', color:'#3B82F6', emoji:'👩‍💻', access:'billing'},
    {id:'waiter1', name:'Amit Singh',   role:'Waiter',     pin:'3333', color:'#10B981', emoji:'🧑‍🍽️', access:'order'},
    {id:'kitchen1',name:'Suresh Kumar', role:'Chef',       pin:'4444', color:'#F59E0B', emoji:'👨‍🍳', access:'kitchen'},
    {id:'mgr1',    name:'Deepa Nair',   role:'Supervisor', pin:'5555', color:'#8B5CF6', emoji:'👩‍💼', access:'all'},
    {id:'waiter2', name:'Ravi Verma',   role:'Waiter',     pin:'6666', color:'#F97316', emoji:'🧑‍🍽️', access:'order'}
  ],
  MENU: [
    {id:1, name:'Masala Dosa',          price:90,  cat:'Breakfast',   veg:true,  code:'MD',  active:true, gst:5},
    {id:2, name:'Idli Sambar (2 pcs)',  price:70,  cat:'Breakfast',   veg:true,  code:'IS',  active:true, gst:5},
    {id:3, name:'Aloo Paratha',         price:80,  cat:'Breakfast',   veg:true,  code:'AP',  active:true, gst:5},
    {id:4, name:'Poha',                 price:60,  cat:'Breakfast',   veg:true,  code:'PH',  active:true, gst:5},
    {id:5, name:'Bread Omelette',       price:80,  cat:'Breakfast',   veg:false, code:'BO',  active:true, gst:5},
    {id:6, name:'Veg Biryani',          price:180, cat:'Main Course', veg:true,  code:'VB',  active:true, gst:5},
    {id:7, name:'Chicken Biryani',      price:240, cat:'Main Course', veg:false, code:'CB',  active:true, gst:5},
    {id:8, name:'Paneer Butter Masala', price:210, cat:'Main Course', veg:true,  code:'PBM', active:true, gst:5},
    {id:9, name:'Dal Tadka',            price:150, cat:'Main Course', veg:true,  code:'DT',  active:true, gst:5},
    {id:10,name:'Butter Chicken',       price:280, cat:'Main Course', veg:false, code:'BC',  active:true, gst:5},
    {id:11,name:'Mutton Curry',         price:340, cat:'Main Course', veg:false, code:'MC',  active:true, gst:5},
    {id:12,name:'Veg Fried Rice',       price:160, cat:'Main Course', veg:true,  code:'VFR', active:true, gst:5},
    {id:13,name:'Chicken Tikka',        price:290, cat:'Starters',    veg:false, code:'CT',  active:true, gst:5},
    {id:14,name:'Paneer Tikka',         price:230, cat:'Starters',    veg:true,  code:'PT',  active:true, gst:5},
    {id:15,name:'Veg Manchurian',       price:180, cat:'Starters',    veg:true,  code:'VM',  active:true, gst:5},
    {id:16,name:'Fish Fry',             price:320, cat:'Starters',    veg:false, code:'FF',  active:true, gst:5},
    {id:17,name:'French Fries',         price:130, cat:'Snacks',      veg:true,  code:'FFS', active:true, gst:5},
    {id:18,name:'Veg Sandwich',         price:100, cat:'Snacks',      veg:true,  code:'VS',  active:true, gst:5},
    {id:19,name:'Mango Lassi',          price:80,  cat:'Beverages',   veg:true,  code:'ML',  active:true, gst:5},
    {id:20,name:'Masala Chai',          price:40,  cat:'Beverages',   veg:true,  code:'CHI', active:true, gst:5},
    {id:21,name:'Cold Coffee',          price:90,  cat:'Beverages',   veg:true,  code:'CC',  active:true, gst:5},
    {id:22,name:'Fresh Lime Soda',      price:60,  cat:'Beverages',   veg:true,  code:'FLS', active:true, gst:5},
    {id:23,name:'Gulab Jamun',          price:80,  cat:'Desserts',    veg:true,  code:'GJ',  active:true, gst:5},
    {id:24,name:'Ice Cream (2 scoops)', price:110, cat:'Desserts',    veg:true,  code:'IC',  active:true, gst:5},
    {id:25,name:'Rasmalai',             price:120, cat:'Desserts',    veg:true,  code:'RM',  active:true, gst:5}
  ],
  INVENTORY: [
    {id:'rice',    name:'Basmati Rice',    unit:'kg',  stock:18, min:5, max:30, restock:[]},
    {id:'chicken', name:'Chicken (Raw)',   unit:'kg',  stock:4,  min:5, max:20, restock:[]},
    {id:'paneer',  name:'Paneer',          unit:'kg',  stock:7,  min:3, max:15, restock:[]},
    {id:'mutton',  name:'Mutton',          unit:'kg',  stock:2,  min:3, max:12, restock:[]},
    {id:'milk',    name:'Milk',            unit:'ltr', stock:12, min:5, max:25, restock:[]},
    {id:'oil',     name:'Cooking Oil',     unit:'ltr', stock:9,  min:4, max:20, restock:[]},
    {id:'onion',   name:'Onion',           unit:'kg',  stock:0,  min:3, max:15, restock:[]},
    {id:'tomato',  name:'Tomato',          unit:'kg',  stock:6,  min:4, max:15, restock:[]},
    {id:'flour',   name:'Wheat Flour',     unit:'kg',  stock:14, min:5, max:25, restock:[]},
    {id:'dal',     name:'Toor Dal',        unit:'kg',  stock:8,  min:3, max:15, restock:[]},
    {id:'coffee',  name:'Coffee Powder',   unit:'kg',  stock:3,  min:2, max:8,  restock:[]},
    {id:'icecream',name:'Ice Cream (Tub)', unit:'nos', stock:4,  min:2, max:10, restock:[]}
  ],
  TABLES: [
    {id:'T1',  label:'Table 1',   type:'Dining',       seats:4},
    {id:'T2',  label:'Table 2',   type:'Dining',       seats:4},
    {id:'T3',  label:'Table 3',   type:'Dining',       seats:2},
    {id:'T4',  label:'Table 4',   type:'Dining',       seats:6},
    {id:'T5',  label:'Table 5',   type:'Dining',       seats:4},
    {id:'T6',  label:'Table 6',   type:'Dining',       seats:4},
    {id:'T7',  label:'Table 7',   type:'Outdoor',      seats:2},
    {id:'T8',  label:'Table 8',   type:'Outdoor',      seats:4},
    {id:'R101',label:'Room 101',  type:'Room Service', seats:2},
    {id:'R102',label:'Room 102',  type:'Room Service', seats:2},
    {id:'R201',label:'Room 201',  type:'Room Service', seats:3},
    {id:'R202',label:'Room 202',  type:'Room Service', seats:2},
    {id:'PD',  label:'Pool Deck', type:'Outdoor',      seats:6},
    {id:'BAR', label:'Bar Counter',type:'Bar',         seats:8}
  ],
  tableStatus: {},
  bills: [],
  kots: [],
  onlineOrders: [],
  deductionLog: []
};

// Pre-populate table statuses
DEFAULT_STATE.TABLES.forEach(t => {
  DEFAULT_STATE.tableStatus[t.id] = { status: 'free', amount: 0, items: 0, since: null, order: {} };
});

/**
 * Load state from localStorage.
 * Always overrides STAFF with the hardcoded list so login always works.
 */
function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Always use built-in staff — prevents login screen from going blank
      parsed.STAFF = DEFAULT_STATE.STAFF;
      // Ensure tableStatus exists for all tables
      DEFAULT_STATE.TABLES.forEach(t => {
        if (!parsed.tableStatus || !parsed.tableStatus[t.id]) {
          parsed.tableStatus = parsed.tableStatus || {};
          parsed.tableStatus[t.id] = { status: 'free', amount: 0, items: 0, since: null, order: {} };
        }
      });
      return parsed;
    }
  } catch (err) {
    console.warn('[POS] localStorage read failed, using defaults:', err.message);
  }
  // Deep clone to avoid mutating defaults
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

/**
 * Persist state to localStorage.
 */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[POS] localStorage write failed:', err.message);
  }
}

// ── Public API ─────────────────────────────────────────────

/** Compatibility shim — socket events are no-ops in static mode */
export const socket = { on: () => {}, emit: () => {} };

/**
 * Bootstrap the app: loads state from localStorage and fires onInitialState.
 * Uses requestAnimationFrame to guarantee DOM is painted first.
 */
export function initSocketListeners(callbacks) {
  try {
    const state = getState();
    // Use rAF so DOM is fully laid out before we attempt to render cards
    requestAnimationFrame(() => {
      try {
        callbacks.onInitialState(state);
      } catch (err) {
        console.error('[POS] onInitialState callback failed:', err);
      }
    });
  } catch (err) {
    console.error('[POS] initSocketListeners failed:', err);
  }
}

/** Save a top-level key (MENU, bills, kots, etc.) to localStorage */
export function syncState(key, data) {
  try {
    const state = getState();
    state[key] = data;
    saveState(state);
  } catch (err) {
    console.error('[POS] syncState failed:', err);
  }
}

/** Save a single table's status to localStorage */
export function syncTableStatus(tid, data) {
  try {
    const state = getState();
    state.tableStatus = state.tableStatus || {};
    state.tableStatus[tid] = data;
    saveState(state);
  } catch (err) {
    console.error('[POS] syncTableStatus failed:', err);
  }
}

/** Notify that an order is ready — local toast only in static mode */
export function notifyOrderReady(msg) {
  console.log('[POS] Order ready:', msg);
  // The calling code handles the toast via onOrderReady callback
}
