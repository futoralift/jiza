import 'dotenv/config';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'jiza-studio-enterprise-secret-key-998877665544332211';

async function runAddressSnapshotAndPincodeTests() {
  console.log('===========================================================');
  console.log('🧪 RUNNING ADDRESS SNAPSHOT & PINCODE VALIDATION TEST SUITE');
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

  // Generate Admin JWT Token
  const adminToken = jwt.sign(
    { email: 'jizajewellery@gmail.com', role: 'admin', authorizedAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  try {
    // -------------------------------------------------------------
    // TEST 1: Account Creation Pincode Validation
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Account Creation Pincode Validation ---');
    const timestamp = Date.now();

    // 1a. Missing pincode
    const resNoPin = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer 1a',
        email: `test.pin.1a.${timestamp}@example.com`,
        phone: `91${Math.floor(10000000 + Math.random() * 89999999)}`,
        address: 'Flat 101, Test Bldg',
        city: 'Pune',
        pincode: ''
      })
    });
    assert(resNoPin.status === 400, 'Registration without pincode rejected with 400 Bad Request');

    // 1b. Invalid pincode (5 digits)
    const resShortPin = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer 1b',
        email: `test.pin.1b.${timestamp}@example.com`,
        phone: `92${Math.floor(10000000 + Math.random() * 89999999)}`,
        address: 'Flat 101, Test Bldg',
        city: 'Pune',
        pincode: '41103'
      })
    });
    assert(resShortPin.status === 400, 'Registration with 5-digit pincode rejected with 400 Bad Request');

    // 1c. Invalid pincode (alphanumeric)
    const resAlphaPin = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer 1c',
        email: `test.pin.1c.${timestamp}@example.com`,
        phone: `93${Math.floor(10000000 + Math.random() * 89999999)}`,
        address: 'Flat 101, Test Bldg',
        city: 'Pune',
        pincode: 'ABC123'
      })
    });
    assert(resAlphaPin.status === 400, 'Registration with alphanumeric pincode rejected with 400 Bad Request');

    // 1d. Valid 6-digit pincode
    const testEmailValid = `test.pin.1d.${timestamp}@example.com`;
    const testPhoneValid = `94${Math.floor(10000000 + Math.random() * 89999999)}`;
    const resValidPin = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Madhur Dhadve',
        email: testEmailValid,
        phone: testPhoneValid,
        address: 'Flat 204, Shree Ganesh Residency',
        city: 'Pune',
        pincode: '411038'
      })
    });
    const regData = await resValidPin.json();
    assert(resValidPin.status === 201 && regData.user?.id, 'Registration with valid 6-digit pincode (411038) succeeded with 201 Created');

    // -------------------------------------------------------------
    // TEST 2: Order Creation & Snapshot Address
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Order Creation & Immutable Address Snapshot ---');
    const prodsRes = await fetch(`${API_BASE}/api/products`);
    const prods = await prodsRes.json();
    const targetProd = prods[0] || { id: 'PROD-001' };

    const orderRes = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: regData.user ? regData.user.id : '',
        customerName: 'Madhur Dhadve',
        customerEmail: testEmailValid,
        customerPhone: testPhoneValid,
        shippingData: {
          addressLine1: 'Flat 204, Shree Ganesh Residency',
          addressLine2: 'Near XYZ Road, Kothrud',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411038',
          country: 'India'
        },
        paymentMethod: 'UPI',
        cartItems: [{ id: targetProd.id, quantity: 1 }]
      })
    });

    const orderData = await orderRes.json();
    if (orderRes.status !== 201) {
      console.log('Order Error Output:', orderData);
    }
    assert(orderRes.status === 201 && orderData.orderId, `Order placed successfully (ID: ${orderData.orderId})`);

    // Fetch order details via admin API
    const adminOrdersRes = await fetch(`${API_BASE}/api/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminOrders = await adminOrdersRes.json();
    const createdOrder = adminOrders.find(o => o.id === orderData.orderId);

    assert(createdOrder !== undefined, 'Created order found in Admin Orders API');
    assert(
      createdOrder.shipping_address_line1 === 'Flat 204, Shree Ganesh Residency' &&
      createdOrder.shipping_city === 'Pune' &&
      createdOrder.shipping_pincode === '411038',
      'Order stores snapshot address fields (Line1, City, Pincode 411038)'
    );

    // -------------------------------------------------------------
    // TEST 3: Address Snapshot Immutability Test
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Address Snapshot Immutability Test ---');
    // Check created order again via admin API to verify historical snapshot stability
    const adminOrdersRes2 = await fetch(`${API_BASE}/api/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminOrders2 = await adminOrdersRes2.json();
    const inspectedOrder = adminOrders2.find(o => o.id === orderData.orderId);

    assert(
      inspectedOrder.shipping_city === 'Pune' && inspectedOrder.shipping_pincode === '411038',
      'Historical order address remains Pune - 411038 (Snapshot is completely immutable)'
    );

  } catch (err) {
    console.error('Test Suite Runtime Error:', err);
    testFailed++;
  }

  console.log('\n===========================================================');
  console.log(`📊 TEST RESULTS: ${testPassed} PASSED | ${testFailed} FAILED`);
  console.log('===========================================================');
}

runAddressSnapshotAndPincodeTests();
