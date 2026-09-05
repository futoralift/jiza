# Jiza Jewellery Studio — Production System & Documentation

Welcome to **Jiza Jewellery Studio**, a digital storefront and administrative management platform engineered for hand-crafted Indian heritage jewellery (Kundan, Polki, Maharashtrian, South Indian, and Victorian collections).

Built as a state-based Single Page Application (SPA) with a Node.js Express REST API and PostgreSQL relational database, the system is designed to support **100,000+ users/year**, **1,000+ concurrent users during peak traffic**, and **1,000+ orders/day**.

---

## 🌟 Key Implemented Features

- **Automatic Shipping Engine**: Free Shipping on orders ₹1,000 or above; automatic ₹100 flat shipping on orders below ₹1,000 (Store Pickup is always ₹0).
- **Add to Cart + Buy Now Dual CTA**: Available across Homepage, Search, Product Detail Modal, and Wishlist with fly-to-cart animation and instant checkout navigation.
- **Physical Studio Pickup**: Option for store pickup at Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar, Pune - 411051.
- **Real-Time Stock Limit Enforcement**: Strict inventory cap prevents customers from adding or incrementing cart quantities beyond available product stock, backed by PostgreSQL `FOR UPDATE` transaction locks.
- **Strict 10-Digit Mobile Number Validation & `+91` Prefix**: Numeric digit mask, 10-digit limit, and embedded blush country code badge across all customer and admin forms.
- **Minimal Video Reels (9 Shorts)**: Clean, zero-control 9:16 vertical video reel row situated between Customer Favourites and Best Sellers.
- **Modular Admin Panel (`src/components/admin/`)**: Clean modular design decomposed into `AdminSidebar`, `AdminHeader`, tabs (`Dashboard`, `Products`, `Orders`, `Customers`, `Reviews`, `Problems`, `Analytics`, `Categories`, `RentalGallery`, `StoreSettings`, `PremiumFeatures`), and modals.
- **Product Code System**: End-to-end integration across Product CMS → PostgreSQL DB (`product_code UNIQUE`) → Storefront Product Page → Cart/Checkout → Immutable Order Snapshot (`items_json`) → Admin Orders Manager.
- **Dedicated Rental Collection Gallery CMS**: Image-only gallery management with drag-and-drop selection, preview thumbnails with `Remove ×`, backend upload (`/api/admin/rental-gallery`), deletion dialog (`RentalDeleteModal`), and customer gallery view (`RentalGalleryView.jsx`).
- **Complete Address Snapshot System**: Orders store immutable address snapshot fields (`shipping_address_line1`, `shipping_city`, `shipping_pincode`, etc.). Admin Order Details modal renders the exact delivery snapshot.
- **Compulsory Indian Pincode System**: 6-digit numeric Indian pincode validation (`/^\d{6}$/`) on frontend and backend.
- **Hardened IST Order Date Range Filtering**: Order date filtering based on `Asia/Kolkata` (IST) timezone boundaries.
- **Authenticated Admin Rate Limiter Exemption**: Generic public IP rate limiters skip authenticated admin sessions via `isAuthedAdmin`.
- **1-Click Data Exports**: Export Orders and Customers database to `.CSV` and `.xlsx` files using the `xlsx` package.
- **DPDP Act (2023) Compliance**: Right-to-erasure account deletion and historical order data anonymization (`POST /api/users/delete-account`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Material Symbols, Google Fonts
- **Backend**: Node.js 20 LTS, Express 5, Helmet, CORS, Express Rate Limit
- **Database**: PostgreSQL 14+ (`pg` connection pool with row-level `FOR UPDATE` transaction locks)
- **Authentication**: 4FA Admin Login, 24-hour signed JWT sessions (`requireAdminAuth`), friction-free customer login
- **Payment & Email**: Razorpay live SDK with HMAC SHA256 signature verification & webhooks, Gmail Nodemailer transactional emails
- **Export Utility**: SheetJS (`xlsx`) for `.CSV` and `.xlsx` file generation
- **Process Manager**: PM2 Cluster Mode (`ecosystem.config.cjs`)
- **Reverse Proxy**: Nginx with Gzip compression and SSL termination

---

## 📂 Project Structure

```
Jiza Demo/
├── Docs/                         # Project Documentation Reports (11 Master Specifications)
│   ├── DOCUMENTATION_DIRECTORY_INDEX.md
│   ├── WEBSITE_TECHNICAL_DOCUMENTATION.md
│   ├── ADMIN_PANEL_TECHNICAL_DOCUMENTATION.md
│   ├── SECURITY_AUDIT_REPORT.md
│   ├── INVENTORY_AND_CHECKOUT_SECURITY_REPORT.md
│   ├── PERFORMANCE_OPTIMIZATION_REPORT.md
│   ├── PRODUCTION_READINESS_REPORT.md
│   ├── INDIAN_ECOMMERCE_LEGAL_COMPLIANCE_GUIDE.md
│   ├── SEO_GEO_AEO_REPORT.md
│   ├── PROJECT_FINAL_REMAINING_TASKS.md
│   └── HOSTINGER_VPS_DEPLOYMENT_GUIDE.md
├── server/
│   ├── index.js                  # Main Express REST Server
│   ├── db/
│   │   ├── database.js           # PostgreSQL connection pool & helper
│   │   └── schema_pg.sql         # PostgreSQL schema & indexes
│   └── services/
│       ├── emailService.js       # Transactional mailer (Nodemailer)
│       └── razorpayService.js    # Razorpay SDK & HMAC verification
└── src/
    ├── App.jsx                   # Root application state & view router
    ├── components/               # UI views, drawers, and modals
    └── admin/                    # Modularized Admin Panel suite
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 20 LTS or higher
- PostgreSQL 14 or higher running locally or remotely

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in database credentials:
```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGDATABASE=jiza_store
PGUSER=your_postgres_user_here
PGPASSWORD=your_postgres_password_here
ADMIN_JWT_SECRET=your_random_jwt_secret_key_minimum_64_characters_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

### 3. Installation & Bootstrapping
```bash
# Install dependencies
npm install

# Start Backend Server
npm run server

# Start Frontend Dev Server (in a separate terminal)
npm run dev
```

### 4. Build & Production Verification
```bash
# Build for production
npm run build

# Run automated test suites
node scratch/test_production_readiness_audit.js
node scratch/test_rate_limiting_and_product_code.js
node scratch/test_address_snapshot_and_pincode.js
node scratch/test_order_date_filtering.js
node scratch/test_pickup_and_modification.js
node scratch/test_rental_gallery.js
```

---

## 📚 Documentation Directory (`Docs/`)

For detailed technical references, refer to the files in `Docs/`:
- **[Admin Credentials & Roles Specification](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/ADMIN_CREDENTIALS_AND_ROLES.md)**
- **[Website Technical Documentation](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/WEBSITE_TECHNICAL_DOCUMENTATION.md)**
- **[Admin Panel Technical Documentation](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/ADMIN_PANEL_TECHNICAL_DOCUMENTATION.md)**
- **[Security Audit Report](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/SECURITY_AUDIT_REPORT.md)**
- **[Inventory & Checkout Security Report](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/INVENTORY_AND_CHECKOUT_SECURITY_REPORT.md)**
- **[Performance Optimization Report](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/PERFORMANCE_OPTIMIZATION_REPORT.md)**
- **[Production Readiness Report](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/PRODUCTION_READINESS_REPORT.md)**
- **[Indian E-Commerce Legal Compliance Guide](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/INDIAN_ECOMMERCE_LEGAL_COMPLIANCE_GUIDE.md)**
- **[SEO / GEO / AEO Discovery Report](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/SEO_GEO_AEO_REPORT.md)**
- **[Hostinger VPS Deployment Guide](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/HOSTINGER_VPS_DEPLOYMENT_GUIDE.md)**
- **[Final Launch Tasks & Roadmap](file:///c:/Users/madhu/Documents/Jiza%20Demo/Docs/PROJECT_FINAL_REMAINING_TASKS.md)**
