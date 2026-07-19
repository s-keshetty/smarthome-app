# Smart Home and Homelab Management System

A web-based application for monitoring and managing consumer smart home devices and self-hosted homelab infrastructure from a single dashboard. Users can track device health, server uptime, storage utilization, network bandwidth, and camera status, receive alerts when thresholds are crossed, review an activity log, and define basic automation rules.

This is a proof-of-concept built for a Master's software engineering project. Device readings are currently simulated by a monitoring poller rather than pulled from live device hardware.

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
│           ├── devices.js      # list, add, delete, device detail
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

Create a file at `backend/.env` with the following values. **This file is gitignored and must never be committed.**

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

In the Supabase SQL editor, run the contents of `backend/db/schema.sql`. This creates the six tables: `users`, `devices`, `metric_readings`, `alerts`, `event_logs`, and `automation_rules`.

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

Admin accounts can add and remove devices and manage the system; standard users can view dashboards and receive alerts.

## How It Works

Once devices are added, the backend poller runs every 60 seconds. For each device it generates a reading based on the device type (uptime for servers, storage for NAS, online status for cameras, bandwidth for network gear), stores the reading, updates the device's status, and raises an alert if a threshold is crossed (for example, storage above 80% or a device going offline). All significant events are written to the activity log.

## Requirement Coverage

| Requirement | Feature |
|---|---|
| FR-1 | User registration and login (bcrypt + JWT) |
| FR-2 | Role-based access control (admin / standard) |
| FR-3 | Centralized dashboard |
| FR-4–FR-8 | Uptime, bandwidth, storage, camera monitoring, and alerting (poller) |
| FR-9 | Activity logging |
| FR-11 | Automation rules |
| FR-12 | Device management and device detail view |

## Status

**Implemented:** authentication, RBAC, dashboard, monitoring/alerting, logging, automation, device management.

**Planned:** deployment to Render (backend) and Vercel (frontend), remote access (FR-10), admin user-management screen, federated login, live device integration, and automated tests.

## Authors

Laurynas Motuzis · Sreeja Keshetty