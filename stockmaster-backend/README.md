# StockMaster Backend API

Backend service for StockMaster AI Inventory Management System built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/stockmaster
JWT_SECRET=your-super-secret-jwt-key-change-in-production
N8N_WEBHOOK_URL=https://n8n-latest-wsv0.onrender.com/webhook/otp
NODE_ENV=development
```

3. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000` (or the PORT specified in .env).

## 📡 API Endpoints

### Authentication

- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Login and get JWT token
- `POST /auth/request-otp` - Request OTP for password reset
- `POST /auth/reset-password` - Reset password using OTP

### Dashboard

- `GET /dashboard/summary` - Get dashboard summary (KPI metrics)
- `GET /dashboard/activity` - Get recent stock activity (last 20 moves)

### Products

- `GET /products` - List all products (with filters: search, category)
- `POST /products` - Create a new product (Manager+)
- `GET /products/:id` - Get product details
- `PUT /products/:id` - Update product (Manager+)
- `DELETE /products/:id` - Delete product (Admin only)
- `GET /products/:id/stock` - Get stock levels by warehouse for a product

### Categories

- `GET /categories` - List all categories
- `POST /categories` - Create a new category (Manager+)
- `DELETE /categories/:id` - Delete a category (Manager+)

### Warehouses

- `GET /warehouses` - List all warehouses
- `POST /warehouses` - Create a new warehouse (Admin only)
- `PUT /warehouses/:id` - Update warehouse (Admin only)

### Documents (Receipts/Deliveries/Transfers/Adjustments)

- `GET /documents` - List documents (with filters: type, status, warehouse, dateFrom, dateTo, productId)
- `POST /documents` - Create a new document (all roles)
- `GET /documents/:id` - Get document details
- `PUT /documents/:id` - Update document (if not DONE)
- `POST /documents/:id/validate` - Validate/execute document (Manager+)

### Stock Moves (Ledger)

- `GET /stock-moves` - Get stock movement history (with filters: warehouse, product, dateFrom, dateTo, documentType)

## 🔐 Authentication

All endpoints except `/auth/*` require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 Roles & Permissions

- **Admin**: Full access to all operations
- **Manager**: Can create/edit products, validate documents, limited settings access
- **Staff**: Can create documents, execute ready documents, view-only for most resources

## 📦 Document Types

- **RECEIPT**: Stock coming into a warehouse
- **DELIVERY**: Stock going out of a warehouse
- **TRANSFER**: Stock moving between warehouses
- **ADJUSTMENT**: Stock count adjustments

## 🔄 Document Workflow

1. Create document (status: DRAFT)
2. Update document as needed
3. Validate document (status: DONE) - This executes the stock movement

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional details"
  }
}
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **OTP Delivery**: n8n webhook integration

## 📝 Notes

- CORS is enabled for all origins (MVP configuration)
- JWT tokens expire after 24 hours
- OTP expires after 5 minutes
- OTP resend cooldown: 30 seconds
- Stock operations use MongoDB transactions for atomicity
- All stock movements are logged in the StockMoves collection (ledger)

## 🔮 Future Enhancements

- Rate limiting
- Caching layer
- Advanced analytics
- AI-powered predictions
- Barcode/QR scanning support
- Offline-first mobile app support

