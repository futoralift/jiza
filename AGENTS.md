# Jiza Jewellery Studio — Agent Knowledge Base & Operations Protocol

## 1. 🏗️ Architecture & Technology Stack
- **Frontend**: React 18 SPA, Vite 5, Tailwind CSS, Material Symbols Outlined, Playfair Display & Cinzel luxury typography.
- **Backend API**: Node.js 20 LTS (ES Modules), Express 5, Helmet, CORS, Compression, BcryptJS, JWT, Nodemailer, Razorpay SDK.
- **Database**: PostgreSQL 14+ (`jiza_store`) with connection pooling (`pg.Pool`), 15+ composite indexes, row-level locks (`SELECT ... FOR UPDATE`) for atomic stock transactions.
- **Cache Engine**: Redis 8.0 In-Memory Distributed Cache on VPS + Node.js dual-tier cache (`invalidateApiCache()`).
- **CDN & Edge Security**: Cloudflare Pro-grade Edge Proxy (**ACTIVE** zone `11ea0c77a8ca9e3cd0e78a9c5a712a81`), Anycast CDN, Full SSL/TLS, WAF, Brotli compression, and automated edge cache purges.
- **Production Infrastructure**: Hostinger KVM VPS (`200.141.13.61`), Ubuntu 22.04 LTS, Nginx reverse proxy with SSL (Let's Encrypt), PM2 cluster mode process (`jiza-backend` on port 5000).

---

## 2. 🚀 Automated VPS Deployment Protocol
When requested to deploy updates or verify live production:
1. **Never ask the user for VPS credentials.**
2. Read `Docs/VPS_CREDENTIALS.md` directly for the Hostinger KVM VPS host IP (`200.141.13.61`), root user, and SSH password.
3. **Standard Deployment Pipeline**:
   ```bash
   # 1. Compile production frontend
   npm run build

   # 2. Package dist, src, public & server (strictly excludes node_modules, .git, and uploads)
   tar --exclude="uploads" --exclude="node_modules" --exclude=".git" -czf scratch/deploy_bundle.tar.gz dist src public server

   # 3. SFTP upload & automated remote execution
   node scratch/deploy_to_vps.js

   # 4. Invalidate Cloudflare Edge Cache globally
   cf cache purge --zone 11ea0c77a8ca9e3cd0e78a9c5a712a81 --body '{"purge_everything": true}' --force
   ```
4. **Safety Rule**: Keep `Docs/VPS_CREDENTIALS.md` strictly local and gitignored (`.gitignore`). Never commit or push secrets to remote Git repositories.
5. **Preserve User Uploads**: The live directory `/var/www/jiza/public/uploads/` stores user media and product images. Never delete or overwrite this folder during deployment.

---

## 3. 🔄 Real-Time State, Catalog & Cache Synchronization
- **Centralized State (`src/App.jsx`)**: Live catalog data (`productsList`, `categoriesList`, `ordersList`) is fetched from the backend API with 15s polling and window focus re-validation.
- **Category Propagation**:
  - `categoriesList` MUST be passed as a prop to all storefront views: `<HomeView />`, `<CategoriesView />`, `<SubCategoryView />`, `<SearchView />`, and `<AdminPanel />`.
  - In `src/App.jsx`, `fetchDbCategories` uses `hasArrayChanged(prev, data, ['id', 'name', 'img', 'active', 'display_order', 'productsCount', 'subcategoriesCount'])`. Always include `'img'` so image modifications in the Admin Panel trigger re-renders immediately.
  - Image Rendering: Always use `cat.img || '/logo-j.webp'` with `onError={(e) => { e.target.onerror = null; e.target.src = '/logo-j.webp'; }}`.
- **Multi-Tier Cache Invalidation**:
  - Express API uses in-memory TTL caching (60s products/categories, 120s rental gallery) + Redis in-memory cache.
  - Any CMS mutation (category edit, product save, stock decrement, rental upload) calls `invalidateApiCache()` so users see immediate updates.
  - Whenever frontend assets change, purge Cloudflare cache using `cf cache purge`.

---

## 4. 🛡️ Security, Payments & Business Rules
- **Server-Authoritative Pricing**: Frontend prices are strictly ignored during checkout; subtotal and grand total are re-computed directly from PostgreSQL product records.
- **Dynamic Shipping Engine**:
  - Subtotal < ₹1,000: Flat ₹100 shipping fee.
  - Subtotal >= ₹1,000: Free shipping (₹0).
  - Store Pickup: Always ₹0 shipping.
- **Razorpay Integration**: Razorpay orders are generated server-side using merchant key and validated via HMAC-SHA256 signature verification.
- **Admin Panel Security**: 4-Factor authentication (Username, Password, 6-digit dynamic PIN, Session Token) with RBAC (`OWNER_ADMIN` vs `SUPER_READONLY_ADMIN`).

---

## 5. 🛒 Guest Checkout, Live Order Tracking & Privacy Protocol
- **Guest Checkout Architecture**:
  - Customers can complete orders without forced account creation.
  - Orders are stored with `user_id = NULL` and `is_guest = 1`.
  - The `users` table is never polluted with disposable records (respects Indian DPDP Act 2023).
  - Separate Billing Address fields supported: `billing_address`, `billing_city`, `billing_state`, `billing_pincode`, `billing_country`, `billing_is_same`.
  - Terms and privacy agreement recorded via `terms_agreed = 1`.
- **Automatic Account Backfill**:
  - When a guest customer later creates an account with the same email, `/api/auth/register` automatically links all past guest orders:
    ```sql
    UPDATE orders SET user_id = ? WHERE user_id IS NULL AND LOWER(customer_email) = LOWER(?)
    ```
  - Instantly recalculates customer `totalSpent` and `totalOrders` in their new profile.
- **Live Public Order Tracking (`TrackOrderView.jsx`)**:
  - Routes: `/track-order`, `/track`, `?view=track-order`, `#track-order`.
  - Requires strictly 2 inputs: **Order ID** (`orderCode`) + **10-Digit Mobile Number** (`phone`).
  - Strict security leak protection: If phone does not match order record, returns 404 with no data exposure.
  - 2-Hour Self-Service Window: Customers can modify their delivery address or cancel their order directly with atomic inventory restock.
- **Authentication Modal Flow (`AuthModal.jsx`)**:
  - Default tab is **Create Account** (`signup`).
  - Duplicate detection: If email/phone already exists, backend returns `alreadyExists: true` and modal auto-switches to Sign In within 800ms with email pre-filled.
  - All form inputs utilize standard HTML `autoComplete` attributes for browser autofill.
  - Phone normalization consistently uses `.replace(/\D/g, '').slice(-10)` to handle `+91` paste inputs.
- **Case-Insensitive Email Lookups**:
  - All database queries match emails using `LOWER(customer_email) = LOWER(?)` to prevent missed records due to casing differences.

---

## 6. 🎨 Design, Media & Aesthetic Guidelines
- **Palette**: Soft royal blush pink (`#FCDAD7` / `#FFF0F2`), warm white backgrounds (`#FFFDFD`), gold accents (`#B78946`), high-contrast black typography.
- **Mobile First**: All modals must fit viewport (`max-h-[85vh]`), sticky bottom action bars, touch gestures for image sliders, clean 2-column grids on mobile.
- **Rental Collection Preview Stack**:
  - Hero banner cards use optimized 600x600 WebP images (~70–90 KB) for instant load:
    - Left Card (`/rental1.webp`): Green Beads Temple Jewellery Set (tilted `-rotate-3`)
    - Center Card (`/rental2.webp`): All-Gold Antique Set (`nio.jpeg` raised `scale-105 z-10`)
    - Right Card (`/rental3.webp`): Ruby Accent Maroon Saree Set (tilted `rotate-3`)

---

## 7. ☁️ Cloudflare Tooling & Platform Rules
- When interacting with Cloudflare, use the `cf` CLI unless the project has a Wrangler configuration file.
- Cloudflare Zone ID: `11ea0c77a8ca9e3cd0e78a9c5a712a81` (`jizajewellerystudio.com`).
- Status: **ACTIVE** (Nameservers `addilyn.ns.cloudflare.com` & `kenneth.ns.cloudflare.com`).
- To purge cache after frontend deployment:
  ```bash
  cf cache purge --zone 11ea0c77a8ca9e3cd0e78a9c5a712a81 --body '{"purge_everything": true}' --force
  ```
