# Grand Palace Hotel — POS System

A professional, real-time Point of Sale (POS) system built with Node.js, Socket.io, and Vanilla JS.

## Features
- **Real-Time Sync**: All orders, tables, and KOTs synchronized across all devices.
- **Role-Based Access (RBAC)**: Custom views for Manager, Chef, Waiter, and Cashier.
- **PWA Ready**: Installable on mobile devices with offline manifest.
- **Inventory Management**: Real-time stock tracking with auto-deduction.
- **Online Orders**: Integrated management for Swiggy, Zomato, and Direct orders.
- **Advanced Reporting**: Daily revenue tracking and shift reports.

## Architecture
This project follows a professional enterprise-level structure:
- `src/components`: UI components and sections.
- `src/services`: Core services like Socket.io communication.
- `src/utils`: Helper functions and utilities.
- `src/styles`: Modular CSS styling.
- `src/data`: Local state persistence.

## Installation
1. `npm install`
2. `npm run dev`

## Deployment
Compatible with Vercel and standard Node.js environments.
