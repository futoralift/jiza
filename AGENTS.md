# Jiza Jewellery Studio — Agent Knowledge Base & Operations Protocol

## 1. 🏗️ Architecture & Technology Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS, Material Symbols Outlined.
- **Backend API**: Node.js (ES Modules), Express 5, Helmet, CORS, Compression, BcryptJS, JWT, Nodemailer, Razorpay SDK.
- **Database**: PostgreSQL 14+ (`jiza_store`) with connection pooling (`pg.Pool`), row-level locks (`FOR UPDATE`) for atomic stock transactions.
- **Production Infrastructure**: Hostinger KVM VPS (`200.141.13.61`), Ubuntu 22.04 LTS, Nginx reverse proxy with SSL (Let's Encrypt), PM2 cluster mode process (`jiza-backend`).

---

## 2. 🚀 Automated VPS Deployment Protocol
When requested to deploy updates or verify live production:
1. **Never ask the user for VPS credentials.**
2. Read `Docs/VPS_CREDENTIALS.md` directly for the Hostinger KVM VPS host (`200.141.13.61`), root user, and SSH password.
3. **Standard Deployment Pipeline**:
   ```bash
   # 1. Compile production frontend
   npm run build

   # 2. Package dist & source (excludes node_modules, .git, and uploads)
   tar -czf scratch/deploy_bundle.tar.gz dist src

   # 3. SFTP upload & automated remote execution
   node scratch/deploy_to_vps.js
   ```
4. **Safety Rule**: Keep `Docs/VPS_CREDENTIALS.md` strictly local and gitignored (`.gitignore`). Never commit or push secrets to remote Git repositories.
5. **Preserve User Uploads**: The live directory `/var/www/jiza/public/uploads/` stores user media and product images. Never delete or overwrite this folder during deployment.

---

## 3. 🔄 Real-Time State & Catalog Synchronization
- **Centralized State (`src/App.jsx`)**: Live catalog data (`productsList`, `categoriesList`, `ordersList`) is fetched from the backend API with 15s polling and focus re-validation.
- **Category Propagation**:
  - `categoriesList` MUST be passed as a prop to all storefront views: `<HomeView />`, `<CategoriesView />`, `<SubCategoryView />`, `<SearchView />`, and `<AdminPanel />`.
  - In `src/App.jsx`, `fetchDbCategories` uses `hasArrayChanged(prev, data, ['id', 'name', 'img', 'active', 'display_order', 'productsCount', 'subcategoriesCount'])`. Always include `'img'` so image modifications in the Admin Panel trigger re-renders immediately.
  - Image Rendering: Always use `cat.img || '/logo-j.webp'` with `onError={(e) => { e.target.onerror = null; e.target.src = '/logo-j.webp'; }}`.
- **Cache Invalidation**:
  - Express API uses in-memory TTL caching (60s products/categories, 120s rental gallery).
  - Any CMS mutation (category edit, product save, stock decrement) calls `invalidateApiCache()` so users see immediate updates.

---

## 4. 🛡️ Security, Payments & Business Rules
- **Server-Authoritative Pricing**: Frontend prices are ignored during checkout; subtotal and grand total are re-computed directly from PostgreSQL product records.
- **Dynamic Shipping Engine**:
  - Subtotal < ₹1,000: Flat ₹100 shipping fee.
  - Subtotal >= ₹1,000: Free shipping (₹0).
  - Store Pickup: Always ₹0 shipping.
- **Razorpay Integration**: Razorpay orders are generated server-side using merchant key and validated via HMAC-SHA256 signature verification.
- **Admin Panel Security**: 4-Factor authentication (Username, Password, 6-digit dynamic PIN, Session Token) with RBAC (`OWNER_ADMIN` vs `SUPER_READONLY_ADMIN`).

---

## 5. 🎨 Design & Aesthetic Guidelines
- **Palette**: Soft royal blush pink (`#FCDAD7` / `#FFF0F2`), warm white backgrounds (`#FFFDFD`), gold accents (`#B78946`), high-contrast black typography.
- **Mobile First**: All modals must fit viewport (`max-h-[85vh]`), sticky bottom action bars, touch gestures for image sliders, clean 2-column grids on mobile.
