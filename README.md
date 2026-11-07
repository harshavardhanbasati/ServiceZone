# ServiceZone — Precision Repair & Appointment Management Platform

> **"Precision repair. Reliable technology."**  
> A full-stack appointment booking and repair-management platform engineered for a single computer and laptop service center (Workshop Bay 4).

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Tooling-Vite_5-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Typography](https://img.shields.io/badge/Typography-Quantico-246BFD.svg?style=flat-square)](https://fonts.google.com/specimen/Quantico)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-336791.svg?style=flat-square&logo=sqlite)](https://www.sqlite.org)

---

## Table of Contents

1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Quick Start & Server Commands](#2-quick-start--server-commands)
3. [Pre-Seeded Demonstration Accounts](#3-pre-seeded-demonstration-accounts)
4. [User Guide: How to Use ServiceZone](#4-user-guide-how-to-use-servicezone)
   - [Public Experience & Quick Tracking](#41-public-experience--quick-tracking)
   - [Customer Portal Workflow](#42-customer-portal-workflow)
   - [Administrator Operations Workbench](#43-administrator-operations-workbench)
5. [Core Architectural Concepts](#5-core-architectural-concepts)
   - [Dual-Lifecycle Separation](#dual-lifecycle-separation)
   - [Database-Level Double-Booking Prevention](#database-level-double-booking-prevention)
6. [Project File Structure](#6-project-file-structure)
7. [REST API Documentation](#7-rest-api-documentation)
8. [Configuration & Environment Variables](#8-configuration--environment-variables)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)

---

## 1. Project Overview & Philosophy

ServiceZone is designed specifically for an independent, component-level computer hardware repair center. Instead of generic SaaS templates or pastel clinics, it uses a **technical, high-precision aesthetic** with:
- **Typography:** The **Quantico** typeface used throughout every headline, form label, table, and data point.
- **Palette Tokens:** Graphite (`#111820`), Warm Off-White (`#F1F0EB`), Electric Blue (`#246BFD`), Technical Grey (`#D5D9DC`), Amber (`#E5A343`), and Success Green (`#27865B`).
- **Strict Visual Rules:** Zero purple gradients, zero random decorative pills, sharp edges with subtle micro-chamfers, and deliberate editorial layouts.

---

## 2. Quick Start & Server Commands

### 2.1 One-Click Launch (Windows)
Double-click either of the root script shortcuts:
- **`start_all.bat`** (Launches both servers in dedicated command prompts)
- **`start_all.ps1`** (PowerShell launcher)

Both servers will start and become immediately available:
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger Docs:** [http://localhost:8080/docs](http://localhost:8080/docs)
- **Health Telemetry:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

---

### 2.2 Manual Command Line Launch

#### Terminal 1 — Start FastAPI Backend (Port 8080):
```powershell
# Open terminal in project root:
cd "c:\Application Development\UseCases\ServiceZone"

# Activate the pre-configured Python virtual environment:
.\backend\venv\Scripts\Activate.ps1

# (Optional) Re-seed initial demo catalog and slots if needed:
python -m backend.app.db.seed

# Launch the FastAPI Uvicorn server:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload
```

#### Terminal 2 — Start React / Vite Frontend (Port 5173):
```powershell
# In a second terminal:
cd "c:\Application Development\UseCases\ServiceZone\frontend"

# Launch the Vite development server:
npm run dev -- --host 127.0.0.1
```

---

## 3. Pre-Seeded Demonstration Accounts

The application includes pre-configured database records and **one-click credential fill buttons directly on the [Sign In page](http://localhost:5173/login)**:

| Account Type | Email | Password | Access Level & Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@servicezone.tech` | `admin123` | **Operations Console (`/admin/*`)**<br>• Real-time bench statistics & pending intake queue<br>• Service catalog management (CRUD, active toggle)<br>• Batch intake slot generator (30-min windows)<br>• Appointment status transitions (`CONFIRM` / `REJECT` / `COMPLETE`)<br>• Bench repair workbench (Log updates, quotes, final prices)<br>• Customer directory & workshop settings |
| **Demo Customer** | `customer@example.com` | `customer123` | **Customer Portal (`/portal/*`)**<br>• Multi-step guided intake booking flow<br>• Active device repair status ticker<br>• Chronological bench diagnostic timeline<br>• Reschedule or cancel appointments (with instant slot release)<br>• In-app notifications feed & profile settings |

*You can also click **"Register Profile"** to create a brand new customer account at any time.*

---

## 4. User Guide: How to Use ServiceZone

### 4.1 Public Experience & Quick Tracking
- **Explore Services (`/services`):** Search and filter available repair disciplines (Hardware Repair, OS Deployment, Malware Removal, Thermal Maintenance, NVMe Data Recovery, PC Upgrades).
- **Inspect Service Scope (`/services/:slug`):** Review diagnostic methodology, standard inclusions, estimated bench duration, and pricing mode (`STARTING_AT`, `FIXED`, or `QUOTE_ONLY`).
- **Public Repair Telemetry (`/track`):** Anyone with a 5-digit booking reference code (e.g. `SZ-84920`) can view live bench diagnostic updates, oscilloscope readings, and current status without logging in or exposing private customer details.

---

### 4.2 Customer Portal Workflow
1. **Sign In (`/login`):** Click the **"CUSTOMER"** one-click fill button or enter `customer@example.com` / `customer123`.
2. **Book an Intake Appointment (`/portal/book`):**
   - **Step 1 (Service):** Select the target repair service.
   - **Step 2 (Device):** Specify device category (`Laptop`, `Desktop`, `AIO`, `Custom PC`), brand, model, and detailed problem symptoms.
   - **Step 3 (Schedule):** Pick your drop-off date. Available 30-minute intake slots are queried in real time; already-reserved slots are visually struck through and disabled.
   - **Step 4 (Review & Confirm):** Inspect the full ledger and confirm. An exclusive lock is placed on the slot and your unique Reference Code (e.g., `SZ-84920`) is generated.
3. **Manage Appointments (`/portal/appointments`):**
   - **Reschedule:** Click "Reschedule Slot" to atomically move your booking to a new available time.
   - **Cancel:** Click "Cancel Appointment" to immediately release your 30-minute window back to the public pool.
4. **Follow Repair Progress (`/portal/repairs/:bookingId`):**
   - View an immutable, chronological vertical timeline detailing technician bench notes, oscilloscope test findings, part arrivals, and quotes.

---

### 4.3 Administrator Operations Workbench
1. **Sign In as Admin (`/login`):** Click the **"ADMIN"** one-click fill button or enter `admin@servicezone.tech` / `admin123`.
2. **Operations Dashboard (`/admin/overview`):**
   - View live counters: `Pending Approvals`, `Active on Bench`, `Ready for Pickup`, `Total Clients`.
   - Quickly confirm or reject incoming appointment requests in the pending queue.
3. **Catalog Management (`/admin/services`):**
   - Add new repair specifications or edit existing ones.
   - Soft-deactivate services with a single click without breaking historical records.
4. **Slot Generator (`/admin/slots`):**
   - Click **"Batch Generate Slots"**, pick a date range, operating hours (e.g., 09:00 - 18:00), and interval (30 min) to generate availability.
   - Inspect slot occupancy or toggle individual slots active/disabled.
5. **Master Appointments Queue (`/admin/appointments`):**
   - Search across all bookings by reference code, brand, or model.
   - Update appointment status (`CONFIRMED`, `COMPLETED`, `REJECTED`, `CANCELLED`).
6. **Bench Repair Workbench (`/admin/repairs`):**
   - View active bench repairs sorted by lifecycle stage (`DIAGNOSING`, `WAITING_FOR_PARTS`, `IN_PROGRESS`, `READY_FOR_PICKUP`).
   - Click **"Log Update"** to transition stage, input mandatory customer-visible bench notes, and record quoted or final prices. Every change is logged into `repair_updates` and notifies the client.

---

## 5. Core Architectural Concepts

### Dual-Lifecycle Separation
The platform enforces a strict separation between intake appointments and bench hardware repair:

```
[ APPOINTMENT LIFECYCLE ]
  PENDING  -->  CONFIRMED  -->  COMPLETED (Device checked in at Bay 4)
     |              |
     +--> REJECTED  +--> CANCELLED (Slot released)

[ BENCH REPAIR LIFECYCLE ]
  NOT_STARTED  -->  DIAGNOSING  -->  WAITING_FOR_CUSTOMER_APPROVAL
                          |                       |
                          +<----------------------+ (Quote Approved)
                          v
                    WAITING_FOR_PARTS  -->  IN_PROGRESS  -->  READY_FOR_PICKUP  -->  DELIVERED
```

---

### Database-Level Double-Booking Prevention
To eliminate race conditions under concurrent requests without preventing slot reuse after cancellation, the schema uses a **PostgreSQL & SQLite partial unique index**:

```sql
CREATE UNIQUE INDEX uq_active_slot_booking 
ON bookings (slot_id) 
WHERE appointment_status NOT IN ('CANCELLED', 'REJECTED');
```

- When a slot is booked, database integrity guarantees that **at most one** non-cancelled/non-rejected booking can claim that `slot_id`.
- If an appointment is cancelled or rejected, its status changes to `CANCELLED`, which immediately satisfies the index condition and releases the slot for other customers while keeping historical data intact.

---

## 6. Project File Structure

```
ServiceZone/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py               # Dependency injection & RBAC security checks
│   │   │   └── v1/
│   │   │       ├── router.py          # Aggregated REST API v1 router
│   │   │       ├── auth.py            # Customer/Admin registration, login, profile
│   │   │       ├── services.py        # Public service catalog endpoints
│   │   │       ├── slots.py           # Real-time slot availability & public tracking
│   │   │       ├── bookings.py        # Atomic booking, cancellation & rescheduling
│   │   │       ├── admin.py           # Dashboard stats, slot generator, repair workbench
│   │   │       └── notifications.py   # Customer notification stream
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic BaseSettings & environment parameters
│   │   │   ├── database.py            # SQLAlchemy engine, session maker & SQLite/Postgres connect
│   │   │   └── security.py            # JWT token encoding & Bcrypt password hashing
│   │   ├── db/
│   │   │   └── seed.py                # Database seeder (admin, customer, catalog, slots)
│   │   ├── models/
│   │   │   └── __init__.py            # SQLAlchemy models: User, Service, Slot, Booking, RepairUpdate
│   │   ├── schemas/
│   │   │   └── __init__.py            # Pydantic validation schemas
│   │   └── main.py                    # FastAPI root application & CORS configuration
│   ├── requirements.txt               # Backend Python dependencies
│   └── Dockerfile                     # Containerization spec for backend
│
├── frontend/
│   ├── public/
│   │   └── assets/brand/              # Geometric SVGs: logo.svg, favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                # Navbar, Footer, CustomerLayout, AdminLayout
│   │   │   └── ui/                    # TechButton, TechInput, TechSelect, TechBadge, TechDialog
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Authentication provider & JWT persistence
│   │   ├── pages/
│   │   │   ├── public/                # Home, Services, ServiceDetail, About, Contact, TrackRepair, Login, Register
│   │   │   ├── customer/              # CustomerOverview, BookService, MyAppointments, TrackRepairTimeline, Notifications, Profile
│   │   │   └── admin/                 # AdminOverview, AdminServices, AdminSlots, AdminAppointments, AdminRepairs, Customers, Settings
│   │   ├── services/
│   │   │   └── api.js                 # Centralized fetch client with auth token injection
│   │   ├── App.jsx                    # React Router configuration & route guards
│   │   ├── index.css                  # Tailwind directives & Quantico typography styling
│   │   └── main.jsx                   # Application entry point
│   ├── index.html                     # Quantico font imports
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Design tokens & color system
│   ├── vite.config.js                 # Vite development proxy to port 8080
│   └── Dockerfile                     # Frontend multi-stage containerization
│
├── start_all.bat                      # Windows one-click dual launcher
├── start_all.ps1                      # PowerShell dual launcher
├── run_backend.bat                    # Standalone backend runner
├── run_frontend.bat                   # Standalone frontend runner
├── docker-compose.yml                 # Full-stack Docker deployment spec
├── .env.example                       # Environment template
└── README.md                          # Documentation
```

---

## 7. REST API Documentation

When the backend is running, the interactive Swagger documentation is accessible at **`http://127.0.0.1:8080/docs`**.

### Key Endpoints:
- `GET /api/health` — System status and database connectivity.
- `POST /api/v1/auth/register` — Register a customer account (`{ name, email, phone, password }`).
- `POST /api/v1/auth/login` — Authenticate and receive JWT bearer token.
- `GET /api/v1/auth/me` — Retrieve current user profile and role.
- `GET /api/v1/services` — List active services (supports `?category=...&search=...`).
- `GET /api/v1/services/{slug_or_id}` — Get detailed service specification.
- `GET /api/v1/slots/available` — Query availability slots by date (`?date=YYYY-MM-DD`).
- `GET /api/v1/public/track/{reference_code}` — Public repair timeline lookup (no auth required).
- `POST /api/v1/bookings` — Create intake booking (enforces atomic reservation lock).
- `GET /api/v1/bookings/my` — List current customer's booking archive.
- `PATCH /api/v1/bookings/{id}/cancel` — Cancel booking and release slot.
- `PATCH /api/v1/bookings/{id}/reschedule` — Atomically reschedule booking to a new slot.
- `GET /api/v1/bookings/{id}/updates` — Get chronological repair updates for a booking.
- `GET /api/v1/admin/dashboard` — Administrator metrics and pending counts.
- `GET /api/v1/admin/services` & `POST /api/v1/admin/services` — Service catalog management.
- `POST /api/v1/admin/slots/batch` — Batch generate 30-minute intake slots.
- `PATCH /api/v1/admin/bookings/{id}/appointment-status` — Confirm or reject intake appointment.
- `PATCH /api/v1/admin/bookings/{id}/repair-status` — Transition bench repair stage and log technician note.

---

## 8. Configuration & Environment Variables

Default settings run out-of-the-box with zero configuration using local SQLite. To customize parameters, create a `.env` file in the project root:

```env
# Backend Server
PROJECT_NAME="ServiceZone API"
VERSION="1.0.0"
API_V1_STR="/api/v1"
SECRET_KEY="your-production-secret-key-quantico-2026"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Connection (Default SQLite, or switch to PostgreSQL)
DATABASE_URL="sqlite:///./servicezone.db"
# DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/servicezone"

# Workshop Information
BUSINESS_NAME="ServiceZone Precision Repair"
BUSINESS_PHONE="+1 (555) 737-8491"
BUSINESS_EMAIL="intake@servicezone.tech"
BUSINESS_ADDRESS="104 Tech Boulevard, Suite B, Workshop Bay 4"
TIMEZONE="UTC"
AUTO_CONFIRM_BOOKINGS=false
```

---

## 9. Troubleshooting & FAQ

#### Q: Port 8000 threw `WinError 10048`?
**A:** On some Windows installations, port 8000 is reserved by Windows dynamic Hyper-V / WSL port exclusions. The backend is configured to run on **port 8080**, and the frontend Vite proxy automatically routes `/api` traffic to `http://127.0.0.1:8080`.

#### Q: How do I re-seed or reset the database?
**A:** Run the seed script inside the virtual environment:
```powershell
.\backend\venv\Scripts\python.exe -m backend.app.db.seed
```

#### Q: Are online payments enabled in this version?
**A:** In accordance with the Version 1 specifications, online payment processing is intentionally deferred. Diagnostics and physical repair charges are quoted on bench inspection and settled upon device handover.

---

&copy; 2026 ServiceZone Inc. Built with precision engineering.
