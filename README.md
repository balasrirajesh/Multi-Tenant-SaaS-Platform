# Multi-Tenant SaaS Platform

A production-ready, multi-tenant Project Management System built with Node.js, React, and PostgreSQL. This application implements a **Shared Database, Shared Schema** architecture with strict logical isolation using `tenant_id`.

## 🚀 Key Features Implemented

### 1. Multi-Tenancy Architecture
- **Data Isolation:** Every database query is scoped by `tenant_id` to prevent data leaks.
- **Subdomain Resolution:** Tenants are identified via subdomains (e.g., `demo.localhost`).
- **Transactional Registration:** Tenant creation and Admin User creation happen in a single ACID transaction. If one fails, both roll back.

### 2. Security & RBAC
- **JWT Authentication:** Stateless authentication with 24-hour token expiry.
- **Role-Based Access Control (RBAC):**
  - **Super Admin:** System-wide access, can delete tenants (Cascade Delete implemented).
  - **Tenant Admin:** Full control over their own organization's users and projects.
  - **User:** Read/Write access to assigned tasks and projects only.
- **Password Security:** All passwords are hashed using `bcryptjs`.

### 3. Subscription Management & Limits
- **Tiered Plans:** Support for Free, Pro, and Enterprise tiers.
- **Limit Enforcement:** The system checks `max_projects` and `max_users` limits *before* inserting new records.
  - *Example:* A "Free" tenant cannot create more than 3 projects.
- **Dashboard Visualization:** Real-time progress bars showing resource usage vs. plan limits.

### 4. Project & Task Management (CRUD)
- **Projects:** Create, Edit, Delete (with ownership checks).
- **Tasks:**
  - Create and Assign to specific team members.
  - **Status Toggling:** One-click completion status updates.
  - **Prioritization:** Visual badges for High/Medium/Low priority.
  - **Cascade Deletion:** Deleting a project automatically cleans up its tasks.

### 5. Audit Logging
- Critical actions (Login, Create Tenant, Delete User, etc.) are logged to an `audit_logs` table for compliance and security tracking.

---

## 🛠️ Technology Stack
- **Frontend:** React 18 (Vite), Tailwind CSS, Axios, Lucide Icons.
- **Backend:** Node.js (v18), Express.js.
- **Database:** PostgreSQL 15.
- **Infrastructure:** Docker & Docker Compose (Orchestration).

---

## 🏗️ System Architecture
The application uses a 3-tier architecture:
1.  **Client Layer:** React SPA consuming RESTful APIs.
2.  **API Layer:** Express.js server with:
    - `authMiddleware`: Validates JWTs.
    - `roleMiddleware`: Enforces permissions.
    - `tenantMiddleware`: Ensures operations stay within tenant boundaries.
3.  **Data Layer:** PostgreSQL with Foreign Key constraints and Indexing on `tenant_id`.

---

## ⚙️ Environment Variables
The following variables are pre-configured in `docker-compose.yml` for the evaluation environment.

| Variable | Description | Value |
| :--- | :--- | :--- |
| `PORT` | Backend API Port | `5000` |
| `DB_HOST` | Database Service Name | `database` |
| `DB_USER` | Database User | `postgres` |
| `DB_PASSWORD` | Database Password | `postgres` |
| `DB_NAME` | Database Name | `saas_db` |
| `JWT_SECRET` | Token Signing Key | `your_jwt_secret_key` |
| `FRONTEND_URL` | CORS Allowed Origin | `http://frontend:3000` |

---

## 🚀 Installation & Usage

1.  **Clone & Start:**
    ```bash
    git clone <your-repo-url>
    cd Multi-Tenant-SaaS-Platform
    docker-compose up -d
    ```
    *Note: The system automatically runs database migrations and seeds initial data on startup.*

2.  **Access Points:**
    - **Frontend:** [http://localhost:3000](http://localhost:3000)
    - **Backend API:** [http://localhost:5000](http://localhost:5000)
    - **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Default Test Credentials (Seed Data)

Use these credentials to test the various roles and isolation features.

| Role | Email | Password | Tenant / Context |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@system.com` | `Admin@123` | *System Wide* |
| **Tenant Admin** | `admin@demo.com` | `Demo@123` | **Demo Company** |
| **Team Member** | `user1@demo.com` | `User@123` | **Demo Company** |

---

## 📡 API Documentation
The backend exposes 19+ endpoints. Key endpoints include:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/register-tenant` | Register new organization |
| `GET` | `/api/tenants` | List all tenants (Super Admin) |
| `DELETE` | `/api/tenants/:id` | Delete tenant & all data |
| `GET` | `/api/projects` | List projects for current tenant |
| `POST` | `/api/projects` | Create project (Limit checked) |
| `PUT` | `/api/projects/:id` | Update project details |
| `POST` | `/api/tasks` | Create new task |
| `PATCH` | `/api/tasks/:id/status` | Toggle task completion |