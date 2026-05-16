# 🏨 Grand Palace Hotel — Restaurant POS System

> A complete, single-file Hotel Food Ordering & Billing Management System inspired by Petpooja POS. Built with pure HTML, CSS & JavaScript — no installation, no dependencies, runs directly in any browser.

---

## 🚀 Live Demo

Open `hotel_pos_v2.html` directly in your browser — no server needed.

**Demo Login PINs:**

| Staff | Role | PIN |
|-------|------|-----|
| 👨‍💼 Raj Admin | Manager | `1234` |
| 👩‍💻 Priya Sharma | Cashier | `2222` |
| 🧑‍🍽️ Amit Singh | Waiter | `3333` |
| 👨‍🍳 Suresh Kumar | Chef | `4444` |
| 👩‍💼 Deepa Nair | Supervisor | `5555` |
| 🧑‍🍽️ Ravi Verma | Waiter | `6666` |

---

## 📸 Features Overview

### 🔐 Staff Login System
- Login screen with staff profile cards
- Secure 4-digit PIN authentication per staff member
- Staff name logged against every bill and KOT generated
- Role-based profiles: Manager, Cashier, Waiter, Chef, Supervisor
- Logout / end session support

### 🧾 New Order & Billing
- Full menu browser with category filters (Breakfast, Main Course, Starters, Snacks, Beverages, Desserts)
- Search by dish name or short code
- Add / remove items, adjust quantities
- Percentage or flat-amount discount + coupon code support
- Auto GST calculation — CGST 2.5% + SGST 2.5%
- Send KOT to kitchen with one click
- Print thermal-style bill receipt with hotel branding & GSTIN
- Collect payment and auto-clear the table

### 🪑 Counter / Tables
- Live visual grid of 14 tables and rooms
  - Dining Tables (T1–T8), Outdoor, Room Service, Bar Counter, Pool Deck
- Color-coded status: 🟢 Available · 🔴 Occupied · 🟡 Reserved
- Tap an occupied table to mark as paid and free it
- Tap an available table to jump directly to order entry

### 👨‍🍳 Kitchen Order Tickets (KOT)
- Live KOT board for kitchen staff
- Urgent ticket highlighting (red border)
- Mark ticket as **Ready** or **Void**
- Auto-created on every KOT send from the order screen

### 🛵 Online Orders — Swiggy & Zomato
- Unified online order dashboard
- Filter by platform: Swiggy · Zomato · Direct (Room Service)
- Full order lifecycle: **New → Accept → Preparing → Ready → Delivered**
- One-tap Reject with confirmation
- Live counters: New orders · In-progress · Delivered today

### 📦 Inventory Management
- 12 raw material stock items tracked
- Visual stock bar with low/out-of-stock color alerts
- Auto inventory deduction log on every KOT sent
- Manual restock (individual quick restock or bulk restock modal)
- Manual deduction with logging
- Deduction history log with item, reason, quantity & time

### ✏️ Menu Editor
- Add new menu items (name, price, category, veg/non-veg, short code, GST rate)
- Edit any existing item inline via modal
- Delete items with confirmation
- Toggle items ON/OFF with a live switch — disabled items instantly removed from order screen
- Changes reflect live across the entire POS

### 📊 Reports & Bills
- Today's revenue, total bills, pending amount, void count
- Full bill history table with per-bill Pay button
- Staff-wise bill tracking
- Download **Daily Shift Report** (HTML → Print as PDF)

### 📄 Daily Shift Report PDF
The shift report includes:
- Hotel header with GSTIN and contact info
- Revenue summary stats (collected, pending, online)
- Complete bill table with staff attribution
- Online order summary by platform
- Low stock / out-of-stock alerts
- Per-staff activity breakdown
- Auto-triggers browser print dialog for PDF save

---

## 🗂️ Project Structure

```
hotel-pov-/
├── hotel_pos_v2.html     # Complete POS application (single file)
└── README.md             # Project documentation
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Structure & layout |
| CSS3 | Styling, animations, responsive grid |
| Vanilla JavaScript | All logic — orders, billing, inventory, reports |
| Google Fonts | DM Sans + DM Mono typography |
| Browser Print API | Shift report PDF generation |

> **Zero dependencies.** No React, no Node.js, no npm. Just open and use.

---

## ⚙️ How to Use

### Run Locally
```bash
# Clone the repository
git clone https://github.com/Parth137-ai/hotel-pov-.git

# Open the file in your browser
cd hotel-pov-
open hotel_pos_v2.html       # macOS
start hotel_pos_v2.html      # Windows
xdg-open hotel_pos_v2.html   # Linux
```

### Deploy on GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from branch** → `main` → `/ (root)`
3. Click **Save**
4. Your POS will be live at:
   `https://parth137-ai.github.io/hotel-pov-/hotel_pos_v2.html`

---

## 📋 Menu Categories

| Category | Sample Items |
|----------|-------------|
| 🍳 Breakfast | Masala Dosa, Idli Sambar, Aloo Paratha, Poha |
| 🍛 Main Course | Veg/Chicken Biryani, Paneer Butter Masala, Butter Chicken |
| 🍢 Starters | Chicken Tikka, Paneer Tikka, Fish Fry, Veg Manchurian |
| 🍟 Snacks | French Fries, Veg Sandwich, Spring Roll |
| 🥤 Beverages | Mango Lassi, Masala Chai, Cold Coffee, Fresh Lime Soda |
| 🍮 Desserts | Gulab Jamun, Ice Cream, Rasmalai |

---

## 🏗️ Planned Features

- [ ] Multi-shift support with shift handover report
- [ ] UPI / card payment mode selector
- [ ] Customer loyalty points system
- [ ] WhatsApp bill sharing
- [ ] Daily sales chart / graphs
- [ ] Cloud sync with Firebase
- [ ] Multi-language support (Hindi, Gujarati)
- [ ] Printer integration (ESC/POS thermal printer)

---

## 📄 License

This project is licensed under the **MIT License** — free to use, modify and distribute.

---

## 👨‍💻 Author

**Parth** — [@Parth137-ai](https://github.com/Parth137-ai)

> Built with ❤️ for the hospitality industry. If this helped you, please ⭐ star the repo!

---

*Grand Palace Hotel POS — Inspired by Petpooja · Built from scratch*
