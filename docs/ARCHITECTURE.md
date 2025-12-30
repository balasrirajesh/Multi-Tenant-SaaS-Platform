# System Architecture & Design

## 1. Multi-Tenancy Strategy
This project implements **Logical Isolation** (Shared Database, Shared Schema).

### Why this approach?
- **Cost Efficiency:** Single database instance reduces infrastructure costs.
- **Maintainability:** Easier to manage migrations and updates compared to "Database-per-tenant".
- **Scalability:** `tenant_id` indexing ensures queries remain fast even with millions of rows.

### Implementation Details
- **Tenant Context:** The `tenantMiddleware` extracts the subdomain (e.g., `demo.localhost`) to identify the tenant.
- **RLS-like Behavior:** Every repository function explicitly adds `WHERE tenant_id = $1` to SQL queries.
- **Data Leaks Prevention:**
    - Global "Super Admin" actions are separated from "Tenant Admin" actions.
    - Foreign Keys ensure data integrity (e.g., A task cannot be assigned to a user from a different tenant).

---

## 2. Database Schema Design

The schema relies on `tenant_id` UUIDs to partition data.

### Core Tables
1.  **Tenants** (`id`, `name`, `subdomain`, `plan`, `max_projects`)
2.  **Users** (`id`, `tenant_id`, `email`, `password`, `role`)
3.  **Projects** (`id`, `tenant_id`, `name`, `description`)
4.  **Tasks** (`id`, `tenant_id`, `project_id`, `title`, `status`, `priority`)
5.  **Audit_Logs** (`id`, `tenant_id`, `user_id`, `action`, `details`)

### Entity Relationship Diagram (ERD)
* **One Tenant** has **Many Users**.
* **One Tenant** has **Many Projects**.
* **One Project** has **Many Tasks**.
* **One User** has **Many Audit Logs**.

---

## 3. Security Design

### Authentication Flow
1.  User POSTs credentials to `/api/auth/login`.
2.  Server verifies password (bcrypt) and checks `tenant_id` match.
3.  Server issues a **JWT** containing: `{ userId, tenantId, role }`.
4.  Client stores JWT in `localStorage`.

### Role-Based Access Control (RBAC)
| Role                 | Scope  |                   Permissions                             |
| :------------------: | :-----:| :------------------------------------------------------:  |
| **Super Admin**      | Global |   Create/Delete Tenants, View System Audit Logs.          |
| **Tenant Admin**     | Tenant |  Manage Users, Projects, Billing; Cannot delete System.   |
| **User**             | Tenant |   Read/Write assigned Projects/Tasks; No Admin access.    |

---

## 4. Tech Stack Decisions
- **Node.js/Express:** chosen for non-blocking I/O and rapid API development.
- **PostgreSQL:** chosen for robust relational data integrity and JSONB support.
- **React/Vite:** chosen for fast client-side rendering and component modularity.