# API Documentation

Base URL: `http://localhost:5000/api`

## 🔐 Authentication

### 1. Login
**POST** `/auth/login`
- **Body:** `{ "email": "user@demo.com", "password": "password" }`
- **Response:** `{ "success": true, "token": "jwt_string..." }`

### 2. Register Tenant (Super Admin Action)
**POST** `/auth/register-tenant`
- **Body:**
  ```json
  {
    "companyName": "Acme Corp",
    "subdomain": "acme",
    "email": "admin@acme.com",
    "password": "securePass123"
  }