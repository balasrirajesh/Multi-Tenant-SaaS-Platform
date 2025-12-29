# Product Requirements Document (PRD)

## 1. User Personas

### 1.1 Super Admin (System Owner)
* **Role:** The owner of the SaaS platform.
* **Goals:** Monitor system health, manage paid subscriptions, remove abusive tenants.
* **Pain Points:** Impossible to manage hundreds of tenants manually; needs a central dashboard.

### 1.2 Tenant Admin (Customer)
* **Role:** The manager of a specific organization (e.g., "Acme Corp" IT Manager).
* **Goals:** Manage their team members, assign projects, ensure data stays private.
* **Pain Points:** accidental data deletion, managing limits (projects/users).

### 1.3 End User (Team Member)
* **Role:** An employee working on projects.
* **Goals:** Complete assigned tasks, update statuses, view project details.
* **Pain Points:** Confusing UI, unsure what tasks are high priority.

---

## 2. Functional Requirements

### Authentication Module
* **FR-001:** The system shall allow users to login using Email and Password.
* **FR-002:** The system shall issue a JWT with a 24-hour expiry upon successful login.
* **FR-003:** The system shall hash all passwords using Bcrypt before storage.

### Tenant Module
* **FR-004:** The system shall allow the Super Admin to register new Tenants with a unique subdomain.
* **FR-005:** The system shall enforce data isolation so Tenants cannot access other Tenants' data.
* **FR-006:** The system shall prevent Tenant Admins from deleting their own organization (Self-Destruct Block).

### Project Module
* **FR-007:** The system shall allow Tenant Admins to create new Projects.
* **FR-008:** The system shall block Project creation if the Subscription Limit (Max Projects) is reached.
* **FR-009:** The system shall allow updating Project details (Name/Description) via an Edit interface.
* **FR-010:** The system shall support "Cascade Delete" (Deleting a project deletes all its tasks).

### Task Module
* **FR-011:** The system shall allow Users to create Tasks with Priority levels (Low, Medium, High).
* **FR-012:** The system shall allow Users to toggle Task status (Todo/Completed) with a single click.
* **FR-013:** The system shall allow Users to edit Task titles inline to fix errors.
* **FR-014:** The system shall allow deletion of specific tasks.

### Dashboard Module
* **FR-015:** The system shall display a real-time usage bar showing "Projects Used / Max Limit".

---

## 3. Non-Functional Requirements

* **NFR-001 (Security):** All API requests must be validated against a valid JWT signature.
* **NFR-002 (Performance):** Dashboard API response time should be under 200ms for standard tenants.
* **NFR-003 (Scalability):** The database schema must support indexing on `tenant_id` to handle 10,000+ rows efficiently.
* **NFR-004 (Usability):** The UI must handle "Empty States" (e.g., 0 Projects) gracefully without crashing.
* **NFR-005 (Availability):** Critical transactions (Tenant Registration) must use ACID transactions to prevent data corruption.