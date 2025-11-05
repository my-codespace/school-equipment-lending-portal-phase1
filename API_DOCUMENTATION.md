# API Documentation

## Authentication Endpoints

| HTTP Method | Route | Description | Protected? |
|-------------|-------|-------------|------------|
| `POST` | `/api/auth/register` | Registers a new user with name, email, password, and role | No |
| `POST` | `/api/auth/login` | Authenticates a user and returns a JWT token | No |

### Request Body Examples

**Register:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

**Login:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

## Equipment Endpoints

| HTTP Method | Route | Description | Protected? |
|-------------|-------|-------------|------------|
| `POST` | `/api/equipment` | Creates a new equipment item with name, category, condition, and quantity | Yes (Admin) |
| `PUT` | `/api/equipment/:id` | Updates an existing equipment item by ID | Yes (Admin) |
| `DELETE` | `/api/equipment/:id` | Deletes an equipment item by ID | Yes (Admin) |
| `GET` | `/api/equipment` | Retrieves all equipment items with optional filters (category, available) | Yes (Any authenticated user) |

### Query Parameters for GET /api/equipment

- `category` - Filter by equipment category
- `available` - Filter by availability (`true` for available items, `false` for unavailable)

### Request Body Examples

**Add Equipment:**
```json
{
  "name": "Laptop",
  "category": "Electronics",
  "condition": "Good",
  "totalQuantity": 10
}
```

**Edit Equipment:**
```json
{
  "name": "Updated Laptop Name",
  "condition": "Excellent",
  "totalQuantity": 15
}
```

---

## Request Endpoints (Borrow System)

| HTTP Method | Route | Description | Protected? |
|-------------|-------|-------------|------------|
| `POST` | `/api/requests` | Creates a new borrow request for equipment | Yes (Student) |
| `PATCH` | `/api/requests/:id/approve` | Approves a pending borrow request and decrements equipment availability | Yes (Admin/Staff) |
| `PATCH` | `/api/requests/:id/reject` | Rejects a pending borrow request | Yes (Admin/Staff) |
| `PATCH` | `/api/requests/:id/return` | Marks equipment as returned and increments equipment availability | Yes (Admin/Staff) |
| `GET` | `/api/requests` | Retrieves all requests (students see only their own, admins/staff see all with optional filters) | Yes (Any authenticated user) |

### Query Parameters for GET /api/requests

- `user` - Filter by user ID (Admin/Staff only)
- `status` - Filter by request status (`pending`, `approved`, `rejected`, `returned`)

### Request Body Examples

**Create Request:**
```json
{
  "equipmentId": "507f1f77bcf86cd799439011"
}
```

### Business Rules

- Students can only create requests for equipment with available quantity > 0
- Students cannot create duplicate active requests (pending or approved) for the same equipment
- Only pending requests can be approved or rejected
- Only approved requests can be marked as returned
- Approving a request decrements the equipment's available count
- Returning equipment increments the equipment's available count

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained from the `/api/auth/login` endpoint and expires after 2 hours.