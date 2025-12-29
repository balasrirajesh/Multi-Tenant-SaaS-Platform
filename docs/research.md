# Research & System Design Document

## 1. Multi-Tenancy Analysis

### Approaches Comparison

| Approach | Description | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **1. Database-per-Tenant** | Each tenant has their own separate database instance. | Highest isolation security; Easy data backups per tenant; Custom schemas possible. | High infrastructure cost; Difficult to maintain/migrate 1000s of DBs; Complex resource pooling. |
| **2. Schema-per-Tenant** | One database, but each tenant has a distinct namespace/schema. | Good logical isolation; Easier to backup than Shared Schema; Single DB engine to manage. | "Noisy Neighbor" issues; Migration scripts must run N times; Schema limits in Postgres. |
| **3. Shared Database (Discriminator)** | All tenants share tables. Rows are distinguished by a `tenant_id` column. | **Lowest Cost**; Easiest to scale; Fast migrations (run once); Simplified backup strategy. | Risk of data leaks if queries miss `WHERE` clause; Harder to isolate backups per tenant. |

### Justification for Chosen Approach: Shared Database (Approach 3)
For this SaaS Boilerplate, we selected **Shared Database with Logical Isolation** because:
1.  **Cost Efficiency:** We are targeting a SaaS model where free/pro tiers require minimal overhead. Spawning a database per user is too expensive for a boilerplate.
2.  **Development Speed:** Managing a single schema allows for rapid iteration and deployment using standard ORM migrations.
3.  **Performance:** With proper indexing on the `tenant_id` column (which we implemented), PostgreSQL can handle millions of rows with negligible performance loss compared to separate schemas.

---

## 2. Technology Stack Justification

### Backend: Node.js + Express
* **Why:** Node.js offers a non-blocking I/O model perfect for the high-concurrency nature of a multi-tenant app. Express is unopinionated, allowing us to build custom middleware for Tenant Context isolation (`tenantMiddleware.js`) easily.
* **Alternatives:** Python/Django was considered but can be slower for real-time JSON APIs.

### Frontend: React + Vite
* **Why:** React 18's component-based architecture allows us to build reusable UI elements (like our Dashboard Widgets). Vite was chosen over Create-React-App for its superior build performance and HMR (Hot Module Replacement) speed.

### Database: PostgreSQL
* **Why:** PostgreSQL is the industry standard for relational multi-tenancy. Its support for JSONB allows us to store flexible settings per tenant if needed, and its robust Foreign Key constraints enforce our strict data isolation rules.

### Authentication: JSON Web Tokens (JWT)
* **Why:** Stateless authentication is crucial for scalability. JWTs allow us to embed the `tenant_id` directly into the token payload, ensuring that every single request carries the user's context securely without needing frequent database lookups for session validity.

---

## 3. Security Considerations

To secure this multi-tenant system, we implemented the following 5 layers:

1.  **Logical Isolation (Row Level Security):**
    * *Strategy:* Every single database query in our Repositories includes `WHERE tenant_id = $1`.
    * *Prevention:* This prevents "Horizontal Privilege Escalation" where User A sees User B's data.

2.  **Tenant Context Middleware:**
    * *Strategy:* We created `tenantMiddleware.js` which validates the `X-Tenant-ID` or subdomain before the request even reaches the controller. If the context is missing, the request is rejected immediately.

3.  **Bcrypt Password Hashing:**
    * *Strategy:* We use `bcryptjs` with a salt round of 10. Passwords are never stored in plain text. Even DB admins cannot see user passwords.

4.  **Role-Based Access Control (RBAC):**
    * *Strategy:* Middleware checks `req.user.role` against allowed roles.
    * *Rule:* A `tenant_admin` is programmatically blocked from calling "Super Admin" endpoints (like `DELETE /tenants`).

5.  **Audit Logging:**
    * *Strategy:* Critical write operations (Create Project, Delete User) are written to an immutable `audit_logs` table. This provides a trail if a security incident occurs.