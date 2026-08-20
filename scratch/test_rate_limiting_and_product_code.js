import 'dotenv/config';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'jiza-studio-enterprise-secret-key-998877665544332211';

async function runSecurityAndProductCodeTests() {
  console.log('===========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE SECURITY & PRODUCT CODE TEST SUITE');
  console.log('===========================================================');

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      testPassed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      testFailed++;
    }
  }

  // 1. Generate Valid Admin Token
  const validAdminToken = jwt.sign(
    { email: 'jizajewellery@gmail.com', role: 'admin', authorizedAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 2. Generate Non-Admin Token
  const customerToken = jwt.sign(
    { email: 'customer@example.com', role: 'customer', authorizedAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  try {
    // -------------------------------------------------------------
    // TEST 1: Admin Login API Verification
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Admin Login Endpoint Protection ---');
    const loginRes = await fetch(`${API_BASE}/api/admin/auth/verify-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jizajewellery@gmail.com', phone: '8208822696', password: 'JizaAdmin@2026' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success === true, 'Admin Step 1 Auth succeeded with 200 OK');

    // -------------------------------------------------------------
    // TEST 2: High-Volume Authenticated Admin API Requests (Rate Limit Exclusion)
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Authenticated Admin High-Volume API Exemption (>300 Requests) ---');
    let adminReqSuccess = true;
    for (let i = 0; i < 305; i++) {
      const res = await fetch(`${API_BASE}/api/admin/customers`, {
        headers: { 'Authorization': `Bearer ${validAdminToken}` }
      });
      if (res.status === 429) {
        adminReqSuccess = false;
        console.error(`Blocked on request #${i + 1} with 429`);
        break;
      }
    }
    assert(adminReqSuccess, 'Authenticated Admin requests (>300 reqs) completely bypassed generic public IP rate limiter!');

    // -------------------------------------------------------------
    // TEST 3: Non-Admin Token Access to Admin Endpoint
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Non-Admin Token Access to Admin API ---');
    const forbiddenRes = await fetch(`${API_BASE}/api/admin/customers`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    assert(forbiddenRes.status === 403, 'Non-admin token correctly returned 403 Forbidden');

    // -------------------------------------------------------------
    // TEST 4: Invalid/Expired Admin Token
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Invalid Admin Token Access ---');
    const unauthorizedRes = await fetch(`${API_BASE}/api/admin/customers`, {
      headers: { 'Authorization': 'Bearer invalid_garbage_token_123' }
    });
    assert(unauthorizedRes.status === 401, 'Invalid admin token correctly returned 401 Unauthorized');

    // -------------------------------------------------------------
    // TEST 5: Create Product with Product Code
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Create Product with Custom Product Code ---');
    const testCode = 'TEST-CODE-' + Date.now();
    const createProdRes = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({
        productCode: testCode,
        title: 'Test Diamond Necklace',
        category: 'maharashtrian',
        categoryLabel: 'Maharashtrian',
        subcategory: 'Long Sets',
        subcategoryLabel: 'Long Sets',
        sellingPrice: 1999,
        mrp: 2999,
        description: 'Test product for automated suite.',
        images: ['/test.jpg'],
        stockQuantity: 10
      })
    });
    const createProdData = await createProdRes.json();
    console.log('createProdData:', createProdData);
    assert(createProdRes.status === 201 && createProdData.productCode === testCode, `Product created successfully with Product Code '${testCode}'`);

    // -------------------------------------------------------------
    // TEST 6: Duplicate Product Code Rejection
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Duplicate Product Code Enforcement ---');
    const dupProdRes = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({
        productCode: testCode,
        title: 'Duplicate Code Product',
        category: 'maharashtrian',
        subcategory: 'Long Sets',
        sellingPrice: 2499,
        description: 'Should be rejected due to duplicate code.',
        images: ['/test2.jpg']
      })
    });
    const dupProdData = await dupProdRes.json();
    assert(dupProdRes.status === 400 && dupProdData.error.includes('already exists'), `Duplicate Product Code '${testCode}' correctly rejected with 400 Bad Request`);

    // -------------------------------------------------------------
    // TEST 7: Order Creation Snapshots Product Code
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Order Creation Snapshots Product Code in items_json ---');
    const createOrderRes = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Automated Test Customer',
        customerEmail: 'autotest@example.com',
        customerPhone: '9998887776',
        address: '123 Test Street',
        city: 'Mumbai',
        pincode: '400001',
        paymentMethod: 'UPI',
        cartItems: [
          {
            id: createProdData.productId,
            productCode: testCode,
            title: 'Test Diamond Necklace',
            price: 1999,
            quantity: 2
          }
        ]
      })
    });
    const createOrderData = await createOrderRes.json();
    console.log('createOrderData:', createOrderData);
    assert(createOrderRes.status === 201 && createOrderData.orderId, `Order placed successfully with ID '${createOrderData.orderId}'`);

    // Verify Order snapshot in Admin API
    const getOrdersRes = await fetch(`${API_BASE}/api/orders`, {
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const ordersList = await getOrdersRes.json();
    const fetchedOrder = ordersList.find(o => o.id === createOrderData.orderId);
    let snapshotItems = [];
    if (fetchedOrder) {
      try {
        snapshotItems = typeof fetchedOrder.items_json === 'string'
          ? JSON.parse(fetchedOrder.items_json)
          : (fetchedOrder.items_json || []);
      } catch (e) {}
    }
    const snapItem = snapshotItems[0] || {};
    assert(snapItem.productCode === testCode || snapItem.product_code === testCode, `Order items_json correctly snapshot productCode '${testCode}'`);

    // -------------------------------------------------------------
    // TEST 8: Historical Order Preservation on Product Code Update
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Product Code Update Does Not Corrupt Historical Orders ---');
    const updatedTestCode = testCode + '-MODIFIED';
    const updateProdRes = await fetch(`${API_BASE}/api/products/${createProdData.productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({
        productCode: updatedTestCode,
        title: 'Test Diamond Necklace Modified',
        category: 'maharashtrian',
        subcategory: 'Long Sets',
        sellingPrice: 1999,
        images: ['/test.jpg']
      })
    });
    assert(updateProdRes.status === 200, `Product Code updated in catalog to '${updatedTestCode}'`);

    // Re-verify old order still has original snapshot code
    const getOrdersRes2 = await fetch(`${API_BASE}/api/orders`, {
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const ordersList2 = await getOrdersRes2.json();
    const fetchedOrder2 = ordersList2.find(o => o.id === createOrderData.orderId);
    let snapshotItems2 = [];
    if (fetchedOrder2) {
      try {
        snapshotItems2 = typeof fetchedOrder2.items_json === 'string'
          ? JSON.parse(fetchedOrder2.items_json)
          : (fetchedOrder2.items_json || []);
      } catch (e) {}
    }
    const snapItem2 = snapshotItems2[0] || {};
    assert(snapItem2.productCode === testCode, `Historical order preserved original code '${testCode}' despite catalog update to '${updatedTestCode}'`);

    // Clean up test product
    await fetch(`${API_BASE}/api/products/${createProdData.productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });

  } catch (err) {
    console.error('Test Suite Runtime Error:', err);
    testFailed++;
  }

  console.log('\n===========================================================');
  console.log(`📊 TEST RESULTS: ${testPassed} PASSED | ${testFailed} FAILED`);
  console.log('===========================================================');
}

runSecurityAndProductCodeTests();
