import Dexie from 'https://unpkg.com/dexie@3.2.4/dist/modern/dexie.mjs';

export const db = new Dexie('GPHotelPOS');

// Define database schema
db.version(1).stores({
  staff: 'id, role, name',
  menu: 'id, cat, code',
  inventory: 'id, name',
  tables: 'id, status, type',
  bills: 'id, status, time',
  kots: 'id, time',
  onlineOrders: 'id, status, platform, time',
  deductionLog: '++id, time'
});

// Initial Seeding Logic
export async function initDB() {
  const staffCount = await db.staff.count();
  
  if (staffCount === 0) {
    console.log('Seeding initial database...');
    
    // Seed Staff
    await db.staff.bulkAdd([
      {id:'admin',name:'Raj Admin',role:'Manager',pin:'1234',color:'#E94560',emoji:'👨‍💼',access:'all'},
      {id:'biller1',name:'Priya Sharma',role:'Cashier',pin:'2222',color:'#3B82F6',emoji:'👩‍💻',access:'billing'},
      {id:'waiter1',name:'Amit Singh',role:'Waiter',pin:'3333',color:'#10B981',emoji:'🧑‍🍽️',access:'order'},
      {id:'kitchen1',name:'Suresh Kumar',role:'Chef',pin:'4444',color:'#F59E0B',emoji:'👨‍🍳',access:'kitchen'},
      {id:'mgr1',name:'Deepa Nair',role:'Supervisor',pin:'5555',color:'#8B5CF6',emoji:'👩‍💼',access:'all'},
      {id:'waiter2',name:'Ravi Verma',role:'Waiter',pin:'6666',color:'#F97316',emoji:'🧑‍🍽️',access:'order'}
    ]);

    // Seed Menu
    await db.menu.bulkAdd([
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
    ]);

    // Seed Inventory
    await db.inventory.bulkAdd([
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
    ]);

    // Seed Tables
    await db.tables.bulkAdd([
      {id:'T1',label:'Table 1',type:'Dining',seats:4, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'T2',label:'Table 2',type:'Dining',seats:4, status:'occupied',amount:420,items:3,since:'10:15 AM',order:{7:{id:7,name:'Chicken Biryani',price:240,cat:'Main Course',veg:false,code:'CB',active:true,gst:5,qty:1},19:{id:19,name:'Mango Lassi',price:80,cat:'Beverages',veg:true,code:'ML',active:true,gst:5,qty:2}}},
      {id:'T3',label:'Table 3',type:'Dining',seats:2, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'T4',label:'Table 4',type:'Dining',seats:6, status:'occupied',amount:280,items:2,since:'11:00 AM',order:{10:{id:10,name:'Butter Chicken',price:280,cat:'Main Course',veg:false,code:'BC',active:true,gst:5,qty:1},24:{id:24,name:'Ice Cream (2 scoops)',price:110,cat:'Desserts',veg:true,code:'IC',active:true,gst:5,qty:1}}},
      {id:'T5',label:'Table 5',type:'Dining',seats:4, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'T6',label:'Table 6',type:'Dining',seats:4, status:'reserved',amount:0,items:0,since:'12:00 PM',order:{}},
      {id:'T7',label:'Table 7',type:'Outdoor',seats:2, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'T8',label:'Table 8',type:'Outdoor',seats:4, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'R101',label:'Room 101',type:'Room Service',seats:2, status:'occupied',amount:640,items:4,since:'09:30 AM',order:{7:{id:7,name:'Chicken Biryani',price:240,cat:'Main Course',veg:false,code:'CB',active:true,gst:5,qty:2},23:{id:23,name:'Gulab Jamun',price:80,cat:'Desserts',veg:true,code:'GJ',active:true,gst:5,qty:2}}},
      {id:'R102',label:'Room 102',type:'Room Service',seats:2, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'R201',label:'Room 201',type:'Room Service',seats:3, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'R202',label:'Room 202',type:'Room Service',seats:2, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'PD',label:'Pool Deck',type:'Outdoor',seats:6, status:'free', amount:0, items:0, since:null, order:{}},
      {id:'BAR',label:'Bar Counter',type:'Bar',seats:8, status:'free', amount:0, items:0, since:null, order:{}}
    ]);

    // Seed Bills
    await db.bills.bulkAdd([
      {id:'B-0001',table:'Table 1',time:'08:45 AM',items:3,amount:390,status:'paid',staff:'Priya Sharma'},
      {id:'B-0002',table:'Room 102',time:'09:20 AM',items:2,amount:250,status:'paid',staff:'Amit Singh'},
      {id:'B-0003',table:'Table 2',time:'10:15 AM',items:3,amount:420,status:'pending',staff:'Priya Sharma'},
      {id:'B-0004',table:'Table 4',time:'11:00 AM',items:2,amount:280,status:'pending',staff:'Ravi Verma'},
      {id:'B-0005',table:'Room 101',time:'09:30 AM',items:4,amount:640,status:'pending',staff:'Priya Sharma'}
    ]);

    // Seed KOTs
    await db.kots.bulkAdd([
      {id:'K-001',table:'Table 2',time:'10:16 AM',items:[{n:'Chicken Biryani',q:1},{n:'Mango Lassi',q:2}],urgent:false},
      {id:'K-002',table:'Room 101',time:'09:31 AM',items:[{n:'Veg Biryani',q:2},{n:'Gulab Jamun',q:2}],urgent:true}
    ]);

    // Seed Online Orders
    await db.onlineOrders.bulkAdd([
      {id:'SW-8821',platform:'swiggy',customer:'Ankit Patel',address:'B-12 Satellite, Ahmedabad',items:'Chicken Biryani ×1, Mango Lassi ×1',amount:320,status:'new',time:'11:05 AM'},
      {id:'ZO-4412',platform:'zomato',customer:'Meera Shah',address:'7 Paldi Colony, Ahmedabad',items:'Paneer Tikka ×2, Dal Tadka ×1',amount:610,status:'preparing',time:'10:50 AM'},
      {id:'SW-8819',platform:'swiggy',customer:'Rahul Mehta',address:'Vastrapur, Ahmedabad',items:'Butter Chicken ×1, Veg Fried Rice ×1',amount:440,status:'delivered',time:'09:30 AM'},
      {id:'DR-001',platform:'direct',customer:'Room 203 (In-house)',address:'Room 203, Grand Palace Hotel',items:'Masala Dosa ×2, Chai ×2',amount:260,status:'new',time:'11:20 AM'},
      {id:'ZO-4408',platform:'zomato',customer:'Sonal Joshi',address:'CG Road, Ahmedabad',items:'Veg Biryani ×2',amount:360,status:'delivered',time:'08:45 AM'}
    ]);

    // Seed Deduction Log
    await db.deductionLog.bulkAdd([
      {item:'Chicken (Raw)',reason:'Chicken Biryani ×1',qty:'0.3 kg',time:'10:16 AM'},
      {item:'Basmati Rice',reason:'Veg Biryani ×2',qty:'0.4 kg',time:'09:31 AM'},
      {item:'Paneer',reason:'Paneer Tikka ×1',qty:'0.2 kg',time:'11:02 AM'},
      {item:'Onion',reason:'Out of stock alert',qty:'0 kg',time:'08:00 AM'}
    ]);
    
    console.log('Database seeded successfully.');
  }
}
