const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());

// Serve static files from the src directory
app.use(express.static(path.join(__dirname)));
// Serve assets from src/assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// Serve styles from src/styles
app.use('/styles', express.static(path.join(__dirname, 'styles')));
// Serve scripts from src/services, src/utils, etc.
app.use('/services', express.static(path.join(__dirname, 'services')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Serve index.html from src/pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

const DATA_FILE = path.join(__dirname, 'data', 'pos_data.json');

// Default state logic remains the same
let POS_STATE = {
  STAFF: [
    {id:'admin',name:'Raj Admin',role:'Manager',pin:'1234',color:'#E94560',emoji:'👨‍💼',access:'all'},
    {id:'biller1',name:'Priya Sharma',role:'Cashier',pin:'2222',color:'#3B82F6',emoji:'👩‍💻',access:'billing'},
    {id:'waiter1',name:'Amit Singh',role:'Waiter',pin:'3333',color:'#10B981',emoji:'🧑‍🍽️',access:'order'},
    {id:'kitchen1',name:'Suresh Kumar',role:'Chef',pin:'4444',color:'#F59E0B',emoji:'👨‍🍳',access:'kitchen'},
    {id:'mgr1',name:'Deepa Nair',role:'Supervisor',pin:'5555',color:'#8B5CF6',emoji:'👩‍💼',access:'all'},
    {id:'waiter2',name:'Ravi Verma',role:'Waiter',pin:'6666',color:'#F97316',emoji:'🧑‍🍽️',access:'order'}
  ],
  MENU: [
    {id:1,name:'Masala Dosa',price:90,cat:'Breakfast',veg:true,code:'MD',active:true,gst:5},
    {id:2,name:'Idli Sambar (2 pcs)',price:70,cat:'Breakfast',veg:true,code:'IS',active:true,gst:5},
    {id:3,name:'Aloo Paratha',price:80,cat:'Breakfast',veg:true,code:'AP',active:true,gst:5},
    {id:4,name:'Poha',price:60,cat:'Breakfast',veg:true,code:'PH',active:true,gst:5},
    {id:5,name:'Bread Omelette',price:80,cat:'Breakfast',veg:false,code:'BO',active:true,gst:5},
    {id:6,name:'Veg Biryani',price:180,cat:'Main Course',veg:true,code:'VB',active:true,gst:5},
    {id:7,name:'Chicken Biryani',price:240,cat:'Main Course',veg:false,code:'CB',active:true,gst:5},
    {id:8,name:'Paneer Butter Masala',price:210,cat:'Main Course',veg:true,code:'PBM',active:true,gst:5},
    {id:9,name:'Dal Tadka',price:150,cat:'Main Course',veg:true,code:'DT',active:true,gst:5},
    {id:10,name:'Butter Chicken',price:280,cat:'Main Course',veg:false,code:'BC',active:true,gst:5},
    {id:11,name:'Mutton Curry',price:340,cat:'Main Course',veg:false,code:'MC',active:true,gst:5},
    {id:12,name:'Veg Fried Rice',price:160,cat:'Main Course',veg:true,code:'VFR',active:true,gst:5},
    {id:13,name:'Chicken Tikka',price:290,cat:'Starters',veg:false,code:'CT',active:true,gst:5},
    {id:14,name:'Paneer Tikka',price:230,cat:'Starters',veg:true,code:'PT',active:true,gst:5},
    {id:15,name:'Veg Manchurian',price:180,cat:'Starters',veg:true,code:'VM',active:true,gst:5},
    {id:16,name:'Fish Fry',price:320,cat:'Starters',veg:false,code:'FF',active:true,gst:5},
    {id:17,name:'French Fries',price:130,cat:'Snacks',veg:true,code:'FFS',active:true,gst:5},
    {id:18,name:'Veg Sandwich',price:100,cat:'Snacks',veg:true,code:'VS',active:true,gst:5},
    {id:19,name:'Mango Lassi',price:80,cat:'Beverages',veg:true,code:'ML',active:true,gst:5},
    {id:20,name:'Masala Chai',price:40,cat:'Beverages',veg:true,code:'CHI',active:true,gst:5},
    {id:21,name:'Cold Coffee',price:90,cat:'Beverages',veg:true,code:'CC',active:true,gst:5},
    {id:22,name:'Fresh Lime Soda',price:60,cat:'Beverages',veg:true,code:'FLS',active:true,gst:5},
    {id:23,name:'Gulab Jamun',price:80,cat:'Desserts',veg:true,code:'GJ',active:true,gst:5},
    {id:24,name:'Ice Cream (2 scoops)',price:110,cat:'Desserts',veg:true,code:'IC',active:true,gst:5},
    {id:25,name:'Rasmalai',price:120,cat:'Desserts',veg:true,code:'RM',active:true,gst:5}
  ],
  INVENTORY: [
    {id:'rice',name:'Basmati Rice',unit:'kg',stock:18,min:5,max:30,restock:[]},
    {id:'chicken',name:'Chicken (Raw)',unit:'kg',stock:4,min:5,max:20,restock:[]},
    {id:'paneer',name:'Paneer',unit:'kg',stock:7,min:3,max:15,restock:[]},
    {id:'mutton',name:'Mutton',unit:'kg',stock:2,min:3,max:12,restock:[]},
    {id:'milk',name:'Milk',unit:'ltr',stock:12,min:5,max:25,restock:[]},
    {id:'oil',name:'Cooking Oil',unit:'ltr',stock:9,min:4,max:20,restock:[]},
    {id:'onion',name:'Onion',unit:'kg',stock:0,min:3,max:15,restock:[]},
    {id:'tomato',name:'Tomato',unit:'kg',stock:6,min:4,max:15,restock:[]},
    {id:'flour',name:'Wheat Flour',unit:'kg',stock:14,min:5,max:25,restock:[]},
    {id:'dal',name:'Toor Dal',unit:'kg',stock:8,min:3,max:15,restock:[]},
    {id:'coffee',name:'Coffee Powder',unit:'kg',stock:3,min:2,max:8,restock:[]},
    {id:'icecream',name:'Ice Cream (Tub)',unit:'nos',stock:4,min:2,max:10,restock:[]}
  ],
  TABLES: [
    {id:'T1',label:'Table 1',type:'Dining',seats:4},{id:'T2',label:'Table 2',type:'Dining',seats:4},
    {id:'T3',label:'Table 3',type:'Dining',seats:2},{id:'T4',label:'Table 4',type:'Dining',seats:6},
    {id:'T5',label:'Table 5',type:'Dining',seats:4},{id:'T6',label:'Table 6',type:'Dining',seats:4},
    {id:'T7',label:'Table 7',type:'Outdoor',seats:2},{id:'T8',label:'Table 8',type:'Outdoor',seats:4},
    {id:'R101',label:'Room 101',type:'Room Service',seats:2},{id:'R102',label:'Room 102',type:'Room Service',seats:2},
    {id:'R201',label:'Room 201',type:'Room Service',seats:3},{id:'R202',label:'Room 202',type:'Room Service',seats:2},
    {id:'PD',label:'Pool Deck',type:'Outdoor',seats:6},{id:'BAR',label:'Bar Counter',type:'Bar',seats:8},
  ],
  tableStatus: {},
  bills: [],
  kots: [],
  onlineOrders: [],
  deductionLog: []
};

// Initialize tableStatus if empty
POS_STATE.TABLES.forEach(t=>{POS_STATE.tableStatus[t.id]={status:'free',amount:0,items:0,since:null,order:{}};});

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      POS_STATE = JSON.parse(data);
      console.log('Loaded state from data/pos_data.json');
    } catch (e) {
      console.error('Error parsing pos_data.json', e);
    }
  } else {
    saveData();
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(POS_STATE, null, 2));
}

loadData();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('initialState', POS_STATE);

  socket.on('syncState', (key, data) => {
    POS_STATE[key] = data;
    saveData();
    socket.broadcast.emit('stateUpdated', key, data);
  });

  socket.on('syncTableStatus', (tid, data) => {
    POS_STATE.tableStatus[tid] = data;
    saveData();
    socket.broadcast.emit('tableStatusUpdated', tid, data);
  });

  socket.on('orderReadyNotify', (msg) => {
    io.emit('orderReady', msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`POS Server running at http://localhost:${PORT}`);
});
