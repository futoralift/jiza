# Jiza Jewellery Studio — Production System & Documentation

Welcome to **Jiza Jewellery Studio**, an enterprise-grade digital storefront and administrative management platform engineered for hand-crafted Indian heritage jewellery (Kundan, Polki, Maharashtrian, Temple, and Victorian collections).

Built as a state-based Single Page Application (SPA) with a Node.js Express REST API, PostgreSQL relational database, Redis in-memory cache, and Cloudflare Anycast edge network, the system is designed to support **100,000+ users/year**, **1,000+ concurrent users during peak traffic**, and **1,000+ orders/day** with sub-5ms catalog delivery.

---

## 🌟 Key Implemented Features

- **Guest Checkout System (Privacy First)**: Customers can complete purchases without forced account creation (`is_guest = 1`, `user_id = NULL`), preserving consumer privacy under India's Digital Personal Data Protection (DPDP) Act 2023 without polluting the `users` table.
- **Separate Billing Address Support**: Option to supply distinct delivery and billing addresses (`billing_address`, `billing_city`, `billing_pincode`, `billing_state`, `billing_country`, `billing_is_same`).
- **Live Order Tracking Portal (`TrackOrderView.jsx`)**: Public self-service tracking portal accessible via `/track-order` using only **Order ID** and **10-Digit Mobile Number**. Includes visual progress stepper, delivery estimate, courier info, and an automated 2-hour window for address modification or order cancellation with atomic stock restoration.
- **Automatic Past Order Backfill**: When a guest later registers an account with the same email, the backend auto-links all previous guest orders (`UPDATE orders SET user_id = ? WHERE LOWER(customer_email) = ?`) and aggregates lifetime spend and order history in their profile.
- **Case-Insensitive Email Matching**: All backend database queries employ `LOWER(customer_email) = LOWER(?)` lookups backed by composite B-tree indexes.
- **Automatic Shipping Engine**: Free Shipping on orders ₹1,000 or above; automatic ₹100 flat shipping on orders below ₹1,000 (Store Pickup is always ₹0).
- **Add to Cart + Buy Now Dual CTA**: Available across Homepage, Search, Product Detail Modal, and Wishlist with fly-to-cart animation and instant checkout navigation.
- **Physical Studio Pickup**: Option for store pickup at Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar, Pune - 411051.
- **Real-Time Stock Limit Enforcement**: Strict inventory cap prevents customers from adding or incrementing cart quantities beyond available product stock, backed by PostgreSQL `SELECT ... FOR UPDATE` transaction locks.
- **Strict 10-Digit Mobile Number Validation & `+91` Prefix**: Numeric digit mask, 10-digit limit, and embedded blush country code badge across all customer and admin forms with `.slice(-10)` normalization.
- **Minimal Video Reels (9 Shorts)**: Clean, zero-control 9:16 vertical video reel row situated between Customer Favourites and Best Sellers.
- **Modular Admin Panel (`src/components/admin/`)**: Clean modular design decomposed into `AdminSidebar`, `AdminHeader`, tabs (`Dashboard`, `Products`, `Orders`, `Customers`, `Reviews`, `Problems`, `Analytics`, `Categories`, `RentalGallery`, `StoreSettings`, `PremiumFeatures`), and modals with `Guest Checkout` badges and billing snapshots.
- **Dedicated Rental Collection Gallery & Hero Preview**: High-speed WebP hero banner stack featuring optimized studio photography (~70–90 KB per image) with center focus on all-gold antique jewellery, plus a dedicated CMS tab for managing rental catalog items.
- **Cloudflare Edge CDN & Full SSL**: Cloudflare proxied Anycast CDN (Zone `11ea0c77a8ca9e3cd0e78a9c5a712a81`) with WAF, Brotli compression, 103 Early Hints, and automated cache purge integration.
- **1-Click Data Exports**: Export Orders and Customers database to `.CSV` and `.xlsx` files using the `xlsx` package, complete with Order Type (Guest vs Registered) and Billing Address fields.

---

## 🛠️ Technology Stack

| Component | Technology | Version | Role in Architecture |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 18.2.0 | Reactive component tree, modal portal management, view state |
| **Build Tooling** | Vite | 5.1.6 | Fast HMR, code-splitting Rollup chunks, asset pipeline |
| **Styling** | Tailwind CSS + PostCSS | 3.4.1 | Royal blush palette (`#FCDAD7`), typography, mobile layouts |
| **Icons & Typography** | Google Fonts + Icons | CDN | Cinzel, Playfair Display, Hanken Grotesk, Material Symbols |
| **Backend Runtime** | Node.js | 20 LTS (ESM)| High-throughput asynchronous server engine |
| **REST Server** | Express | 5.2.1 | API routing, middlewares, rate-limiters, error handling |
| **Database** | PostgreSQL | 14+ | Relational storage, ACID transactions, row-level locks |
| **Database Driver** | `pg` (node-postgres) | 8.22.0 | Connection pooling (`max: 20`), parameterized queries |
| **In-Memory Cache** | Redis | 8.0 | High-speed response caching for product and category catalog |
| **CDN & Edge Security**| Cloudflare | Anycast | Zone `11ea0c77a8ca9e3cd0e78a9c5a712a81` (Proxied ON, Full SSL) |
| **Payments** | Razorpay SDK | 2.9.8 | Server-side order creation, HMAC-SHA256 signature verification |
| **Transactional Email**| Nodemailer | 9.0.5 | Automated order receipts, tracking CTA links, 4FA admin PINs |
| **Process Manager** | PM2 | 5.x | Cluster mode (`jiza-backend` on port 5000) |
| **Reverse Proxy** | Nginx | 1.28 | Reverse proxy, static asset delivery (`/dist`), Let's Encrypt SSL |

---

## 📂 Project Structure

```
Jiza Final Website/
├── Docs/                         # Project Architecture & Operational Specifications
│   ├── DOCUMENTATION_DIRECTORY_INDEX.md
│   ├── WEBSITE_TECHNICAL_DOCUMENTATION.md
│   ├── ADMIN_PANEL_TECHNICAL_DOCUMENTATION.md
│   ├── SECURITY_AUDIT_REPORT.md
│   ├── INVENTORY_AND_CHECKOUT_SECURITY_REPORT.md
│   ├── PERFORMANCE_OPTIMIZATION_REPORT.md
│   ├── PRODUCTION_READINESS_REPORT.md
│   ├── INDIAN_ECOMMERCE_LEGAL_COMPLIANCE_GUIDE.md
│   ├── SEO_GEO_AEO_REPORT.md
│   ├── CLOUDFLARE_NAMESERVER_HANDOVER.md
│   ├── PROJECT_FINAL_REMAINING_TASKS.md
│   └── HOSTINGER_VPS_DEPLOYMENT_GUIDE.md
├── server/
│   ├── index.js                  # Main Express REST Server & API Endpoints
│   ├── db/
│   │   ├── database.js           # PostgreSQL connection pool & automatic migrations
│   │   └── schema_pg.sql         # PostgreSQL table schemas, constraints & indexes
│   └── services/
│       ├── emailService.js       # Transactional mailer with live tracking links
│       └── razorpayService.js    # Razorpay SDK & HMAC verification
└── src/
    ├── App.jsx                   # Root application state & dynamic view router
    ├── components/               # UI storefront components, drawers, and modals
    │   ├── HomeView.jsx          # Homepage featuring Rental Stack & New Arrivals
    │   ├── CheckoutView.jsx      # Guest & Member checkout with billing address
    │   ├── TrackOrderView.jsx    # Public live order tracking & 2-hour modify/cancel
    │   ├── AuthModal.jsx         # Create Account, Guest, and Sign In modal
    │   ├── RentalGalleryView.jsx # Dedicated rental showroom view
    │   └── admin/                # Modularized Admin Panel suite (tabs & modals)
    └── config.js                 # API base configuration & environment toggles
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js 20 LTS or higher
- PostgreSQL 14 or higher running locally or remotely

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGDATABASE=jiza_store
PGUSER=postgres
PGPASSWORD=your_password
ADMIN_JWT_SECRET=your_jwt_secret_key_minimum_64_characters
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
EMAIL_USER=jizajewellery@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Running Locally
```bash
# Install dependencies
npm install

# Start Backend Server
npm run server

# Start Frontend Dev Server (in a separate terminal)
npm run dev
```

---

## 🌐 Production Deployment Protocol

```bash
# 1. Compile production frontend
npm run build

# 2. Package bundle (excluding node_modules, .git, and uploads)
tar --exclude="uploads" --exclude="node_modules" --exclude=".git" -czf scratch/deploy_bundle.tar.gz dist src public server

# 3. Deploy via automated script to Hostinger VPS
node scratch/deploy_to_vps.js

# 4. Invalidate Cloudflare Edge Cache
cf cache purge --zone 11ea0c77a8ca9e3cd0e78a9c5a712a81 --body '{"purge_everything": true}' --force
```

---

## 📚 Technical Documentation Directory (`Docs/`)

For detailed technical specifications, refer to the files in `Docs/`:
- **[Website Technical Documentation](file:///c:/Users/madhu/Documents/Jiza%20Final%20Website/Docs/WEBSITE_TECHNICAL_DOCUMENTATION.md)**
- **[Admin Panel Technical Documentation](file:///c:/Users/madhu/Documents/Jiza%20Final%20Website/Docs/ADMIN_PANEL_TECHNICAL_DOCUMENTATION.md)**
- **[Cloudflare Nameserver & CDN Activation Guide](file:///c:/Users/madhu/Documents/Jiza%20Final%20Website/Docs/CLOUDFLARE_NAMESERVER_HANDOVER.md)**
- **[Final Launch Tasks & Verification Matrix](file:///c:/Users/madhu/Documents/Jiza%20Final%20Website/Docs/PROJECT_FINAL_REMAINING_TASKS.md)**
- **[Security Audit Report](file:///c:/Users/madhu/Documents/Jiza%20Final%20Website/Docs/SECURITY_AUDIT_REPORT.md)**
- **[Indian E-Commerce Legal Compliance Guide](file:///c:/Users/madhu/Documents/Jiza%20Final%20Website/Docs/INDIAN_ECOMMERCE_LEGAL_COMPLIANCE_GUIDE.md)**
- **[Hostinger VPS Deployment Guide](file:///c:/Users/madhu/Documents/Jiza%20Final%20Website/Docs/HOSTINGER_VPS_DEPLOYMENT_GUIDE.md)**
