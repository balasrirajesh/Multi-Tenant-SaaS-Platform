# Technical Specification

## 1. Project Structure

### Backend (`/backend`)
* `src/controllers/` - Logic for handling API requests (e.g., `projectController.js`).
* `src/models/` - Database schemas and SQL query repositories.
* `src/routes/` - Express route definitions mapping URLs to controllers.
* `src/middleware/` - Security barriers (`authMiddleware.js`, `tenantMiddleware.js`).
* `src/config/` - Database connection and Environment variables.

### Frontend (`/frontend`)
* `src/pages/` - Main View components (Dashboard, Projects, Login).
* `src/components/` - Reusable UI widgets (Navbar, StatCard, Modal).
* `src/context/` - Global state management (AuthContext).
* `src/api/` - Axios configuration and interceptors.

---

## 2. Development Setup Guide

### Prerequisites
* **Node.js:** v18 or higher
* **Docker:** Desktop version installed
* **PostgreSQL:** v15 (Running via Docker)

### Installation Steps
1.  **Clone the Repository:**
    ```bash
    git clone <repo_url>
    cd Multi-Tenant-SaaS-Platform
    ```

2.  **Environment Variables:**
    * Create `.env` in `backend/` with:
        ```
        PORT=5000
        DB_HOST=localhost
        JWT_SECRET=supersecret
        ```

3.  **Run with Docker (Recommended):**
    ```bash
    docker-compose up --build
    ```
    *This command automatically sets up the database, runs migrations, seeds initial data, and starts both Frontend (Port 3000) and Backend (Port 5000).*

4.  **Running Tests:**
    * To run backend unit tests:
        ```bash
        cd backend
        npm test
        ```