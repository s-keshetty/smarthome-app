# Smart Home and Homelab Management System

This is a small web app for keeping an eye on a home lab and smart-home devices in one place. It has a dashboard, device list, alerts, activity log, and basic automation rules.

It was built as a Master's software engineering project. The monitoring poller currently generates sample readings, so it does not connect to physical devices yet.

## Tech Stack

- **Frontend:** React 18 + Vite, React Router
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (hosted on Supabase)
- **Auth:** JWT (jsonwebtoken) with bcrypt password hashing
- **Monitoring:** node-cron scheduled poller

## Project Structure

```
smarthome-app/
├── backend/
│   ├── db/
│   │   └── schema.sql          # Database schema (run in Supabase)
│   └── src/
│       ├── index.js            # Express entry point, starts the poller
│       ├── db.js               # PostgreSQL connection pool
│       ├── middleware/
│       │   └── auth.js         # requireAuth + requireRole
│       ├── jobs/
│       │   └── poller.js       # 60s monitoring cycle + alert logic
│       └── routes/
│           ├── auth.js         # register, login, /me
│           ├── devices.js      # list, add, edit, delete, device detail
│           ├── dashboard.js    # aggregated summary
│           ├── alerts.js       # list, resolve
│           ├── logs.js         # activity feed
│           └── automation.js   # rules CRUD
└── frontend/
    ├── vite.config.js          # dev proxy /api -> localhost:4000
    └── src/
        ├── App.jsx             # routes
        ├── api.js              # axios client with JWT interceptor
        ├── components/
        │   └── Layout.jsx      # sidebar + shell
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Devices.jsx
            ├── DeviceDetail.jsx
            ├── Alerts.jsx
            ├── Logs.jsx
            └── Automation.jsx
```

## Prerequisites

- Node.js (v18 or newer) and npm
- A PostgreSQL database (this project uses Supabase)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/s-keshetty/smarthome-app.git
cd smarthome-app
```

### 2. Configure the backend environment

Create `backend/.env` with the following values. This file is ignored by Git; keep it that way.

```
PORT=4000
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-secret-string
JWT_EXPIRES_IN=1d
```

### 3. Set up the database

In the Supabase SQL editor, run `backend/db/schema.sql`. It creates the tables used by the app: `users`, `devices`, `metric_readings`, `alerts`, `event_logs`, and `automation_rules`.

### 4. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Running Locally

Open two terminals from the project root.

**Terminal 1 — backend (starts the API and the poller):**
```bash
cd backend
npm start
```
The backend runs on `http://localhost:4000`.

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```
The frontend runs on `http://localhost:5173` and proxies API calls to the backend.

Open `http://localhost:5173` in your browser.

## Creating an Admin User

Register a normal account through the app, then promote it to admin by running the following in the Supabase SQL editor (replace with your email):

```sql
UPDATE users SET role='admin' WHERE email='your@email.com';
```

Admins can add, edit, and remove devices. Standard users can view the dashboard and alerts.

## How It Works

The backend poller runs every 60 seconds. It creates a reading for each device based on its type: uptime for servers, storage for NAS devices, online status for cameras, and bandwidth for network gear. It saves the reading, updates the device status, and creates an alert when a threshold is crossed. Important actions also appear in the activity log.

## Requirement Coverage

| Requirement | Feature |
|---|---|
| FR-1 | User registration and login (bcrypt + JWT) |
| FR-2 | Role-based access control (admin / standard) |
| FR-3 | Centralized dashboard |
| FR-4–FR-8 | Uptime, bandwidth, storage, camera monitoring, and alerting (poller) |
| FR-9 | Activity logging |
| FR-11 | Automation rules |
| FR-12 | Add, edit, remove, and view device details |

## Status

Implemented: authentication, role-based access, dashboard, simulated monitoring and alerts, activity logging, automation rules, and device management.

Still to do: deploy the backend and frontend, connect to live devices, add automated tests, and complete the remaining optional features such as federated login.

## Authors

Laurynas Motuzis · Sreeja Keshetty
