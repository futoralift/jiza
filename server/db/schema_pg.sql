-- ======================================================
-- JIZA JEWELLERY STUDIO — POSTGRESQL ENTERPRISE SCHEMA
-- Production Relational Schema for PostgreSQL 14+
-- ======================================================

-- 0. USER SEQUENCE TABLE
CREATE TABLE IF NOT EXISTS user_sequence (
    seq_id SERIAL PRIMARY KEY
);

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash TEXT,
    is_verified INTEGER DEFAULT 0,
    address TEXT,
    pincode VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Maharashtra',
    role VARCHAR(50) DEFAULT 'customer',
    welcome_email_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. EMAIL VERIFICATION CODES TABLE (OTP)
CREATE TABLE IF NOT EXISTS verification_codes (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_email ON verification_codes(email);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    img TEXT,
    display_order INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SUBCATEGORIES TABLE
CREATE TABLE IF NOT EXISTS subcategories (
    id VARCHAR(255) PRIMARY KEY,
    category_id VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    img TEXT,
    display_order INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_id VARCHAR(255) NOT NULL,
    category_label VARCHAR(255) NOT NULL,
    subcategory_id VARCHAR(255),
    subcategory_label VARCHAR(255),
    selling_price NUMERIC(12, 2) NOT NULL,
    mrp NUMERIC(12, 2) DEFAULT 0,
    discount INTEGER DEFAULT 0,
    description TEXT,
    material VARCHAR(255),
    colour VARCHAR(255),
    care_instructions TEXT,
    delivery_time VARCHAR(255) DEFAULT '2-4 Business Days',
    images_json TEXT,
    img TEXT,
    badge VARCHAR(100) DEFAULT 'Standard',
    special_section VARCHAR(100) DEFAULT 'None',
    stock_quantity INTEGER DEFAULT 10,
    in_stock INTEGER DEFAULT 1,
    sold_out INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    product_code VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_special_section ON products(special_section);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    order_code VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_pincode VARCHAR(20),
    shipping_country VARCHAR(100) DEFAULT 'India',
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    payment_method VARCHAR(50) DEFAULT 'UPI',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature TEXT,
    order_email_sent INTEGER DEFAULT 0,
    fulfillment_type VARCHAR(50) DEFAULT 'ship',
    pickup_details_json TEXT,
    modification_history_json TEXT DEFAULT '[]',
    modified_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    items_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_type ON orders(fulfillment_type);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 17. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
    key VARCHAR(100) PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ADMIN ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS admin_accounts (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'SUPER_ADMIN',
    failed_attempts INTEGER DEFAULT 0,
    lockout_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ADMIN OTP TABLE
CREATE TABLE IF NOT EXISTS admin_otps (
    id VARCHAR(255) PRIMARY KEY,
    admin_email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. ADMIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(255) PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS product_reviews (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_order_product ON product_reviews(order_id, product_id);

-- 11. REVIEW PROMPTS TRACKING TABLE
CREATE TABLE IF NOT EXISTS review_prompts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_prompts_order_product ON review_prompts(order_id, product_id);

-- 12. CUSTOMER PROBLEMS (SUPPORT TICKETS) TABLE
CREATE TABLE IF NOT EXISTS customer_problems (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    screenshot TEXT,
    status VARCHAR(50) DEFAULT 'New',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_problems_status ON customer_problems(status);
CREATE INDEX IF NOT EXISTS idx_customer_problems_email ON customer_problems(customer_email);

-- 13. CUSTOMER CARTS TABLE
CREATE TABLE IF NOT EXISTS customer_carts (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    items_json TEXT NOT NULL DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. CUSTOMER WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS customer_wishlists (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    product_ids_json TEXT NOT NULL DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. RAZORPAY WEBHOOK DEDUPLICATION TABLE
CREATE TABLE IF NOT EXISTS razorpay_webhooks (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    payload_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. RENTAL GALLERY TABLE
CREATE TABLE IF NOT EXISTS rental_gallery (
    id VARCHAR(100) PRIMARY KEY,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- High-Performance Composite Indexes for 100k+ users/year & 1k+ orders/day
CREATE INDEX IF NOT EXISTS idx_products_sold_out_created ON products(sold_out, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_email_created ON orders(user_id, customer_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_email_created ON product_reviews(user_id, customer_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_problems_user_email_created ON customer_problems(user_id, customer_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rental_gallery_created ON rental_gallery(created_at DESC);


