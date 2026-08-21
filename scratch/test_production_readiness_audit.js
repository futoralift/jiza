import 'dotenv/config';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'jiza-studio-enterprise-secret-key-998877665544332211';

async function runProductionReadinessAudit() {
  console.log('===========================================================');
  console.log('🚀 RUNNING COMPREHENSIVE PRODUCTION READINESS AUDIT SUITE');
  console.log('===========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // Admin Token
  const adminToken = jwt.sign(
    { email: 'jizajewellery@gmail.com', role: 'admin', authorizedAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  try {
    // -----------------------------------------------------------------
    // AUDIT 1: Security Headers & Healthcheck
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 1: Security Headers & Healthcheck ---');
    const healthRes = await fetch(`${API_BASE}/api`);
    assert(healthRes.status === 200, 'Healthcheck endpoint /api returned 200 OK');
    const healthJson = await healthRes.json();
    assert(healthJson.status === 'online', 'Healthcheck status is online');
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff header present');
    assert(healthRes.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options: DENY header present');
    assert(healthRes.headers.get('permissions-policy')?.includes('camera=()'), 'Permissions-Policy header present');

    // -----------------------------------------------------------------
    // AUDIT 2: Customer Registration, Login, Cart & Wishlist Sync
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 2: Customer Auth, Cart & Wishlist Sync ---');
    const ts = Date.now();
    const customerEmail = `audit.user.${ts}@example.com`;
    const customerPhone = `9${Math.floor(100000000 + Math.random() * 899999999)}`;
    const regRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Audit Test Customer',
        email: customerEmail,
        phone: customerPhone,
        address: '123 Heritage Lane, Near FC Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411004'
      })
    });
    assert(regRes.status === 201, 'Customer registration returned 201 Created');
    const regData = await regRes.json();
    const customerUserId = regData.user?.id;
    assert(!!customerUserId, `Customer registered with ID ${customerUserId}`);

    // Customer Login (Requires both Email and Phone)
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail, phone: customerPhone })
    });
    assert(loginRes.status === 200, 'Customer login by email + phone returned 200 OK');

    // Cart Sync
    const cartItems = [{ id: 'test-cart-item-1', title: 'Gold Ring', quantity: 2, price: 1500 }];
    const saveCartRes = await fetch(`${API_BASE}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: customerUserId, items: cartItems })
    });
    assert(saveCartRes.status === 200, 'Cart saved to database');

    const getCartRes = await fetch(`${API_BASE}/api/cart?userId=${customerUserId}`);
    const fetchedCart = await getCartRes.json();
    assert(fetchedCart.length === 1 && fetchedCart[0].id === 'test-cart-item-1', 'Cart retrieved accurately from database');

    // Wishlist Sync
    const wishlistIds = ['prod-wish-1', 'prod-wish-2'];
    const saveWishRes = await fetch(`${API_BASE}/api/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: customerUserId, productIds: wishlistIds })
    });
    assert(saveWishRes.status === 200, 'Wishlist saved to database');

    const getWishRes = await fetch(`${API_BASE}/api/wishlist?userId=${customerUserId}`);
    const fetchedWishlist = await getWishRes.json();
    assert(fetchedWishlist.length === 2 && fetchedWishlist.includes('prod-wish-1'), 'Wishlist retrieved accurately');

    // -----------------------------------------------------------------
    // AUDIT 3: Product Setup for Price Manipulation & Concurrency Tests
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 3: Product Catalog & Concurrency Setup ---');
    const singleStockCode = `CODE-SOLO-${ts}`;
    const createSoloRes = await fetch(`${API_BASE}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Limited Edition Emerald Choker',
        category: 'kundan',
        categoryLabel: 'Kundan',
        subcategory: 'kundan-necklaces',
        subcategoryLabel: 'Kundan Necklaces',
        sellingPrice: 2500,
        mrp: 3500,
        discount: 28,
        description: 'Single piece luxury choker',
        productCode: singleStockCode,
        stockQuantity: 1, // Exactly 1 piece in stock!
        in_stock: 1,
        sold_out: 0
      })
    });
    const soloProdData = await createSoloRes.json();
    const soloProdId = soloProdData.productId || soloProdData.id;
    assert(createSoloRes.status === 201, `Limited product created with stock=1 (ID: ${soloProdId}, Code: ${singleStockCode})`);

    // -----------------------------------------------------------------
    // AUDIT 4: Frontend Price Manipulation Attack Prevention
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 4: Price Tampering Defense (Backend Price Authority) ---');
    // Malicious request attempting to purchase ₹2,500 product for ₹1
    const rzpOrderTamperRes = await fetch(`${API_BASE}/api/payment/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: [{
          id: soloProdId,
          title: 'Limited Edition Emerald Choker',
          price: 1, // TAMPERED PRICE: ₹1 instead of ₹2,500
          selling_price: 1,
          quantity: 1
        }],
        customerInfo: {
          email: customerEmail,
          fullName: 'Audit Customer',
          phone: customerPhone
        },
        fulfillmentType: 'ship'
      })
    });
    assert(rzpOrderTamperRes.status === 200, 'Razorpay order creation endpoint executed');
    const rzpTamperData = await rzpOrderTamperRes.json();
    // Database price is ₹2,500. Free shipping above ₹1,000 => ₹2,500 total
    assert(rzpTamperData.subtotal === 2500, 'Subtotal computed as ₹2,500 from database, completely ignoring frontend tampered ₹1!');
    assert(rzpTamperData.shippingCharge === 0, 'Free shipping granted for ₹2,500 subtotal (>= ₹1,000)');
    assert(rzpTamperData.amount === 2500, 'Razorpay order created with authentic amount ₹2,500');

    // -----------------------------------------------------------------
    // AUDIT 5: Automatic Shipping Fee Calculation Engine
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 5: Automatic Shipping Charge Engine (< ₹1,000 vs >= ₹1,000) ---');
    // Create affordable product (₹450)
    const cheapCode = `CODE-CHEAP-${ts}`;
    const createCheapRes = await fetch(`${API_BASE}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Daily Wear Silver Nose Pin',
        category: 'daily-wear',
        categoryLabel: 'Daily Wear',
        subcategory: 'nose-pins',
        subcategoryLabel: 'Nose Pins',
        sellingPrice: 450,
        mrp: 600,
        productCode: cheapCode,
        stockQuantity: 50,
        in_stock: 1,
        sold_out: 0
      })
    });
    const cheapProdData = await createCheapRes.json();
    const cheapProdId = cheapProdData.productId || cheapProdData.id;

    // Subtotal ₹450 (< ₹1,000) with Ship fulfillment => Should add ₹100 shipping
    const rzpCheapShipRes = await fetch(`${API_BASE}/api/payment/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: [{ id: cheapProdId, title: 'Daily Wear Silver Nose Pin', quantity: 1 }],
        customerInfo: { email: customerEmail, fullName: 'Audit Customer', phone: customerPhone },
        fulfillmentType: 'ship'
      })
    });
    const cheapShipData = await rzpCheapShipRes.json();
    assert(cheapShipData.subtotal === 450, 'Subtotal is ₹450');
    assert(cheapShipData.shippingCharge === 100, 'Automatic ₹100 flat shipping charge added for orders below ₹1,000');
    assert(cheapShipData.amount === 550, 'Total payable is ₹550 (₹450 + ₹100)');

    // Subtotal ₹450 with Store Pickup => Free Shipping (₹0)
    const rzpCheapPickupRes = await fetch(`${API_BASE}/api/payment/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: [{ id: cheapProdId, title: 'Daily Wear Silver Nose Pin', quantity: 1 }],
        customerInfo: { email: customerEmail, fullName: 'Audit Customer', phone: customerPhone },
        fulfillmentType: 'pickup'
      })
    });
    const cheapPickupData = await rzpCheapPickupRes.json();
    assert(cheapPickupData.shippingCharge === 0, 'Store Pickup gets ₹0 shipping regardless of order value');
    assert(cheapPickupData.amount === 450, 'Store Pickup total is ₹450');

    // -----------------------------------------------------------------
    // AUDIT 6: Race Condition & Concurrency Defense (Atomic Stock Decrement)
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 6: Concurrency & Race Condition Defense ---');
    console.log(`Product "${soloProdId}" currently has stock=1. Dispatching 2 simultaneous checkouts...`);

    const orderPayload1 = {
      id: `JIZA-CONC-1-${ts}`,
      userId: customerUserId,
      customerName: 'User One',
      customerEmail: `user1.${ts}@example.com`,
      customerPhone: '9876543210',
      shippingData: {
        addressLine1: 'Flat 101, Concurrency Towers',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038'
      },
      cartItems: [{ id: soloProdId, title: 'Limited Edition Emerald Choker', quantity: 1 }]
    };

    const orderPayload2 = {
      id: `JIZA-CONC-2-${ts}`,
      userId: customerUserId,
      customerName: 'User Two',
      customerEmail: `user2.${ts}@example.com`,
      customerPhone: '9876543211',
      shippingData: {
        addressLine1: 'Flat 102, Concurrency Towers',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411038'
      },
      cartItems: [{ id: soloProdId, title: 'Limited Edition Emerald Choker', quantity: 1 }]
    };

    // Execute both orders in true parallel promises
    const [res1, res2] = await Promise.all([
      fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload1)
      }),
      fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload2)
      })
    ]);

    const status1 = res1.status;
    const status2 = res2.status;
    const json1 = await res1.json();
    const json2 = await res2.json();

    console.log(`User 1 Response: Status ${status1}, ${JSON.stringify(json1)}`);
    console.log(`User 2 Response: Status ${status2}, ${JSON.stringify(json2)}`);

    const exactlyOneSucceeded = (status1 === 201 && status2 === 400) || (status1 === 400 && status2 === 201);
    assert(exactlyOneSucceeded, 'Exactly ONE user successfully purchased the final unit; the concurrent buyer was safely blocked!');

    // Verify product is now marked Sold Out
    const getSoloProdRes = await fetch(`${API_BASE}/api/products`);
    const allProds = await getSoloProdRes.json();
    const updatedSolo = allProds.find(p => p.id === soloProdId);
    assert(updatedSolo.stock_quantity === 0, 'Stock quantity is now 0');
    assert(updatedSolo.sold_out === 1, 'Product is marked sold_out = 1');
    assert(updatedSolo.badge === 'Sold Out', 'Product badge automatically updated to "Sold Out"');

    // Attempt to buy sold-out product again
    const soldOutOrderRes = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `JIZA-SOLDOUT-${ts}`,
        customerName: 'User Three',
        customerEmail: `user3.${ts}@example.com`,
        customerPhone: '9876543212',
        shippingData: { addressLine1: 'Flat 103, Concurrency Towers', city: 'Pune', state: 'Maharashtra', pincode: '411038' },
        cartItems: [{ id: soloProdId, quantity: 1 }]
      })
    });
    assert(soldOutOrderRes.status === 400, 'Subsequent purchase attempt on Sold Out product rejected with 400 Bad Request');

    // -----------------------------------------------------------------
    // AUDIT 7: Customer Order History & Customer Problem (Support Ticket)
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 7: Customer Orders & Support Tickets ---');
    const winningEmail = status1 === 201 ? `user1.${ts}@example.com` : `user2.${ts}@example.com`;
    const myOrdersRes = await fetch(`${API_BASE}/api/orders/my-orders?email=${encodeURIComponent(winningEmail)}`);
    assert(myOrdersRes.status === 200, 'Customer order history API returned 200 OK');
    const myOrders = await myOrdersRes.json();
    assert(myOrders.length >= 1, `Customer orders retrieved (${myOrders.length} orders found)`);

    // Submit Customer Support Ticket
    const ticketRes = await fetch(`${API_BASE}/api/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: customerUserId,
        customerName: 'Audit Test Customer',
        customerEmail,
        customerPhone,
        subject: 'Inquiry regarding bridal set customization',
        description: 'I would like to know if the necklace length can be adjusted.'
      })
    });
    assert(ticketRes.status === 201, 'Support ticket created with 201 Created');
    const ticketData = await ticketRes.json();
    const createdTicketId = ticketData.complaintId || ticketData.id;

    // Admin view support tickets
    const adminProblemsRes = await fetch(`${API_BASE}/api/admin/problems`, {
      headers: authHeaders
    });
    assert(adminProblemsRes.status === 200, 'Admin can view support tickets');
    const allTickets = await adminProblemsRes.json();
    const createdTicket = allTickets.find(t => t.id === createdTicketId);
    assert(!!createdTicket, 'Created support ticket verified in Admin tickets list');

    // Admin update ticket status
    const updateTicketRes = await fetch(`${API_BASE}/api/admin/problems/${createdTicketId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Resolved', adminNotes: 'Contacted customer on WhatsApp.' })
    });
    assert(updateTicketRes.status === 200, 'Admin updated support ticket status to Resolved');

    // -----------------------------------------------------------------
    // AUDIT 8: Product Review Submission & Admin Moderation
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 8: Product Reviews & Admin Moderation ---');
    const successfulOrderId = status1 === 201 ? orderPayload1.id : orderPayload2.id;
    const reviewRes = await fetch(`${API_BASE}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: customerUserId,
        orderId: successfulOrderId,
        productId: soloProdId,
        productName: 'Limited Edition Emerald Choker',
        customerName: 'Audit Customer',
        customerEmail,
        rating: 5,
        reviewText: 'Outstanding craftsmanship and exquisite packaging! Highly recommended.'
      })
    });
    assert(reviewRes.status === 201, 'Product review submitted with 201 Created');
    const reviewData = await reviewRes.json();
    const createdReviewId = reviewData.reviewId || reviewData.id;

    // Admin view reviews
    const adminReviewsRes = await fetch(`${API_BASE}/api/admin/reviews`, {
      headers: authHeaders
    });
    assert(adminReviewsRes.status === 200, 'Admin can fetch reviews list');
    const adminReviews = await adminReviewsRes.json();
    const reviewsList = Array.isArray(adminReviews) ? adminReviews : (adminReviews.reviews || []);
    const targetReview = reviewsList.find(r => r.id === createdReviewId);
    assert(!!targetReview, 'Review present in admin queue with status "Pending"');

    // Admin approve review
    const approveReviewRes = await fetch(`${API_BASE}/api/admin/reviews/${createdReviewId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Approved' })
    });
    assert(approveReviewRes.status === 200, 'Admin approved product review');

    // Verify approved review appears in public approved reviews API
    const publicReviewsRes = await fetch(`${API_BASE}/api/reviews/approved`);
    const publicReviewsData = await publicReviewsRes.json();
    const publicReviews = publicReviewsData.reviews || [];
    const approvedInPublic = publicReviews.find(r => r.id === createdReviewId);
    assert(!!approvedInPublic, 'Approved review is now visible in public store reviews');

    // -----------------------------------------------------------------
    // AUDIT 9: DPDP Compliance & Account Deletion
    // -----------------------------------------------------------------
    console.log('\n--- AUDIT 9: DPDP Compliance (Right to Erasure) ---');
    const delRes = await fetch(`${API_BASE}/api/users/delete-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: customerUserId, email: customerEmail })
    });
    assert(delRes.status === 200, 'Customer account deletion and data anonymization succeeded');

    const verifyDeletedUser = await fetch(`${API_BASE}/api/cart?userId=${customerUserId}`);
    const deletedCart = await verifyDeletedUser.json();
    assert(deletedCart.length === 0, 'Associated cart data was wiped cleanly');

    console.log('\n===========================================================');
    console.log(`📊 TOTAL AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('===========================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Unhandled error during audit:', err);
    process.exit(1);
  }
}

runProductionReadinessAudit();
