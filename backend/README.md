# 🍳 RecipeHub Backend — Production-Ready API

Welcome to the **RecipeHub Backend**, an enterprise-grade RESTful API built with **Node.js, Express, TypeScript, and MongoDB (Mongoose)** for a modern Recipe Sharing & E-Commerce Platform.

---

## 🌟 Key Features

- 🔐 **Complete Authentication & Security**:
  - Customer registration with role escalation prevention (strictly enforces `USER` role).
  - Secure login with bcrypt password hashing.
  - JWT tokens issued via **HTTP-only, SameSite cookies** and Bearer token fallback.
  - Cryptographically secure single-use, 10-minute expiring password reset tokens.
  - Account blocking protection (blocked users cannot access any protected routes).
- 👥 **Role-Based Access Control (RBAC)**:
  - **ADMIN**: Platform management, moderation, analytics, user blocking/unblocking, recipe featuring/deletion.
  - **SELLER**: Recipe creation, owner-restricted CRUD, recipe analytics, seller dashboard.
  - **USER**: Recipe browsing, filtering, search, like/unlike, commenting, wishlist, cart, orders, reviews, reports.
- 🍲 **Recipe Management & Business Rules**:
  - **Free Recipe Limit**: Normal sellers can create a maximum of **2 recipes**.
  - **Unlimited Recipes**: Unlocked when seller upgrades to **Premium Membership**.
  - Advanced multi-category filtering (`$in` logic: `?category=Italian,Mexican`), cuisine, difficulty, search term.
  - Server-side pagination (`total`, `totalPages`, `page`, `limit`, `hasNextPage`, `hasPreviousPage`).
- 👍 **Interactive Features**:
  - Atomic Like / Unlike toggle with duplicate prevention and live count tracking.
  - Nested recipe comments with author/seller/admin moderation controls.
  - User wishlists with duplicate item protection.
- 🛒 **E-Commerce & Orders**:
  - User Cart with server-verified database pricing (preventing client-side tampering).
  - Order creation from Cart or direct items with order lifecycle statuses (`pending`, `confirmed`, `completed`, `cancelled`).
- 💳 **Stripe Checkout & Webhooks**:
  - Stripe Checkout sessions for orders and premium memberships.
  - Automated Stripe Webhook verification and transaction logging.
- 🚨 **Recipe Reporting & Moderation**:
  - Users can report recipes (`Spam`, `Offensive Content`, `Copyright Issue`).
  - Admins can dismiss or resolve reports (with automatic recipe deletion option).
- 📊 **Dashboards & Aggregations**:
  - **Admin Dashboard**: Aggregations for total revenue, users, sellers, recipes, premium members, reports, and orders.
  - **Seller Dashboard**: Seller's total recipes, total likes, total comments, and premium status.
  - **User Dashboard**: User's total favorites, orders, purchased recipes, and premium status.
- 🛡️ **Centralized Error Handling**:
  - Standardized JSON responses for validation errors, Zod errors, CastErrors, duplicate key errors, and AppErrors.

---

## 🏗️ Architecture & Folder Structure

The backend follows a clean, scalable **Modular Architecture**:

```
backend/
├── src/
│   ├── app/
│   │   ├── config/             # Environment & configuration loader
│   │   ├── errors/             # Custom AppError and Mongoose/Zod error handlers
│   │   ├── middleware/         # Auth, RoleAuth, ErrorHandler, ValidateRequest, NotFound
│   │   ├── modules/            # Domain-driven feature modules
│   │   │   ├── admin/          # Admin management & platform analytics
│   │   │   ├── auth/           # Registration, login, logout, password reset
│   │   │   ├── cart/           # Shopping cart operations
│   │   │   ├── category/       # Recipe categories
│   │   │   ├── comment/        # Recipe comments
│   │   │   ├── order/          # Orders and status transitions
│   │   │   ├── payment/        # Stripe payments and transaction history
│   │   │   ├── recipe/         # Recipe CRUD, filtering, likes
│   │   │   ├── report/         # Recipe violation reports
│   │   │   ├── seller/         # Seller dashboard and metrics
│   │   │   ├── user/           # User profile and stats
│   │   │   └── wishlist/       # User wishlist
│   │   ├── routes/             # Master API router
│   │   └── utils/              # CatchAsync, SendResponse, Email, Stripe, Tokens
│   ├── tests/                  # Automated Jest & Supertest integration tests
│   ├── app.ts                  # Express application setup
│   └── server.ts               # Server bootstrap & MongoDB connection
├── .env.example
├── jest.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB & Mongoose
- **Validation**: Zod
- **Authentication**: JWT & HTTP-only Cookies, bcryptjs
- **Payments**: Stripe API & Webhooks
- **Email Delivery**: Nodemailer
- **Testing**: Jest, Supertest, mongodb-memory-server
- **Security**: Helmet, CORS, Cookie-Parser, Morgan

---

## ⚙️ Environment Variables

Create a `.env` file in `/backend` using `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/recipehub
JWT_SECRET=super_secret_jwt_key_recipehub_123456789
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_mock_key
STRIPE_WEBHOOK_SECRET=whsec_mock_key
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=mock_user
SMTP_PASSWORD=mock_pass
SMTP_FROM="RecipeHub Support <support@recipehub.com>"
PASSWORD_RESET_URL=http://localhost:3000/reset-password
```

---

## 🚀 Installation & Running

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript type check
npm run lint

# Run full automated test suite
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## 📖 API Documentation & Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register customer account (`USER` role) |
| `POST` | `/api/auth/login` | Public | Login & receive HTTP-only cookie |
| `POST` | `/api/auth/logout` | Public | Logout & clear cookies |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token via email |
| `POST` | `/api/auth/reset-password` | Public | Reset password using single-use token |
| `PATCH` | `/api/auth/change-password` | Authenticated | Change current account password |

### 2. Recipes (`/api/recipes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/recipes` | Public | List recipes with pagination & filtering |
| `GET` | `/api/recipes/featured` | Public | List featured recipes |
| `GET` | `/api/recipes/popular` | Public | List recipes sorted by likes |
| `GET` | `/api/recipes/my-recipes` | `SELLER` | List recipes created by current seller |
| `GET` | `/api/recipes/:id` | Public | Get single recipe details |
| `POST` | `/api/recipes` | `SELLER` | Create recipe (Max 2 free, unlimited for premium) |
| `PATCH` | `/api/recipes/:id` | `SELLER`, `ADMIN` | Update recipe (Seller can only update own) |
| `DELETE` | `/api/recipes/:id` | `SELLER`, `ADMIN` | Delete recipe (Seller can only delete own) |
| `POST` | `/api/recipes/:id/like` | `USER` | Toggle like/unlike on recipe |
| `GET` | `/api/recipes/:id/like-status` | `USER` | Check if user liked recipe |

### 3. Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all categories |
| `GET` | `/api/categories/:id` | Public | Get category details |
| `POST` | `/api/categories` | `ADMIN` | Create category |
| `PATCH` | `/api/categories/:id` | `ADMIN` | Update category |
| `DELETE` | `/api/categories/:id` | `ADMIN` | Delete category |

### 4. Comments (`/api/recipes/:recipeId/comments` & `/api/comments`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/recipes/:recipeId/comments` | Public | List comments on recipe |
| `POST` | `/api/recipes/:recipeId/comments` | `USER` | Add comment on recipe |
| `PATCH` | `/api/comments/:id` | `USER` (Author) | Edit own comment |
| `DELETE` | `/api/comments/:id` | Author, `ADMIN`, Seller | Delete comment |

### 5. Wishlist (`/api/wishlist`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/wishlist` | `USER` | View current user's wishlist |
| `POST` | `/api/wishlist/:recipeId` | `USER` | Add recipe to wishlist |
| `DELETE` | `/api/wishlist/:recipeId` | `USER` | Remove recipe from wishlist |

### 6. Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | `USER` | View current user's cart |
| `POST` | `/api/cart` | `USER` | Add recipe to cart (Server calculates price) |
| `PATCH` | `/api/cart/:recipeId` | `USER` | Update item quantity |
| `DELETE` | `/api/cart/:recipeId` | `USER` | Remove item from cart |
| `DELETE` | `/api/cart` | `USER` | Clear entire cart |

### 7. Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | `USER` | Create order from cart or items |
| `GET` | `/api/orders/my-orders` | `USER` | Get logged-in user's orders |
| `GET` | `/api/orders/:id` | `USER`, `ADMIN` | Get order details |

### 8. Payments (`/api/payment`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payment/checkout-order` | `USER` | Create Stripe session for order |
| `POST` | `/api/payment/checkout-premium` | `USER`, `SELLER` | Create Stripe session for Premium Membership |
| `POST` | `/api/payment/verify-session` | Authenticated | Verify session & update order/membership |
| `POST` | `/api/payment/webhook` | Public (Stripe) | Stripe webhook verification endpoint |
| `GET` | `/api/payment/my-payments` | Authenticated | View payment transaction history |

### 9. Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reports` | `USER` | Report a recipe (`Spam`, `Offensive`, `Copyright`) |
| `GET` | `/api/reports` | `ADMIN` | View reported recipes |
| `PATCH` | `/api/reports/:id/resolve` | `ADMIN` | Resolve report (with optional recipe deletion) |
| `PATCH` | `/api/reports/:id/dismiss` | `ADMIN` | Dismiss report |

### 10. Admin Management & Dashboard (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | `ADMIN` | Platform statistics (Revenue, Users, Orders, etc.) |
| `GET` | `/api/admin/users` | `ADMIN` | List all platform users |
| `PATCH` | `/api/admin/users/:id/block` | `ADMIN` | Block user account |
| `PATCH` | `/api/admin/users/:id/unblock` | `ADMIN` | Unblock user account |
| `PATCH` | `/api/admin/users/:id/role` | `ADMIN` | Change user role (`ADMIN`, `SELLER`, `USER`) |
| `PATCH` | `/api/admin/recipes/:id/feature` | `ADMIN` | Toggle featured status for recipe |
| `GET` | `/api/admin/orders` | `ADMIN` | View all platform orders |
| `PATCH` | `/api/admin/orders/:id` | `ADMIN` | Update order status |
| `GET` | `/api/admin/transactions` | `ADMIN` | View platform payment transactions |

### 11. Dashboards
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/sellers/dashboard` | `SELLER` | Seller metrics (Recipes, Likes, Comments, Premium) |
| `GET` | `/api/users/dashboard` | `USER` | User metrics (Favorites, Orders, Purchased Recipes) |

---

## 🔒 Security Practices

- **Strict Role Permissions**: All mutations and protected endpoints verified on backend.
- **Price Integrity**: All item prices in cart/orders are queried from MongoDB, completely ignoring client-sent values.
- **Secure Password Hashing**: Passwords hashed with bcrypt (salt rounds: 10).
- **HTTP-Only Cookies**: JWTs stored securely in HTTP-only, secure, SameSite cookies.
- **Zod Schema Validation**: All request bodies and query parameters validated against strict schemas.
