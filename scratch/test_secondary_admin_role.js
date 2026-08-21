// =========================================================================
// Automated Verification Script: Secondary Read-Only Admin Role & RBAC
// =========================================================================

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('\n===========================================================');
  console.log('🚀 TESTING SECONDARY READ-ONLY ADMIN (SUPER_READONLY_ADMIN)');
  console.log('===========================================================\n');

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

  // -------------------------------------------------------------
  // TEST 1: Secondary Admin 4FA Login
  // -------------------------------------------------------------
  console.log('--- TEST 1: Secondary Admin 4FA Login (futoralift@gmail.com) ---');
  
  const step1Res = await fetch(`${BASE_URL}/api/admin/auth/verify-credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'futoralift@gmail.com',
      phone: '8446653644',
      password: 'Msd@7821'
    })
  });
  const step1Data = await step1Res.json();
  assert(step1Res.status === 200 && step1Data.success === true, 'Step 1: Credentials verification successful');

  const step2Res = await fetch(`${BASE_URL}/api/admin/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'futoralift@gmail.com',
      otp: '123456'
    })
  });
  const step2Data = await step2Res.json();
  assert(step2Res.status === 200 && step2Data.token && step2Data.role === 'SUPER_READONLY_ADMIN', 
    'Step 2: OTP verification returned 200 OK with role: SUPER_READONLY_ADMIN');

  const readonlyToken = step2Data.token;

  // -------------------------------------------------------------
  // TEST 2: Read Access (GET Operations must all SUCCEED with 200 OK)
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Secondary Admin Read & Export Data Access (GET endpoints) ---');

  const getEndpoints = [
    { url: '/api/admin/products', name: 'Products Catalog' },
    { url: '/api/admin/categories', name: 'Categories CMS' },
    { url: '/api/admin/subcategories', name: 'Subcategories CMS' },
    { url: '/api/orders', name: 'Orders List & Export Source' },
    { url: '/api/admin/customers', name: 'Customers Database & Export Source' },
    { url: '/api/admin/reviews', name: 'Customer Product Reviews' },
    { url: '/api/admin/problems', name: 'Customer Support Tickets' },
    { url: '/api/admin/rental-gallery', name: 'Rental Gallery Collection' },
    { url: '/api/admin/store-settings/pickup', name: 'Studio Pickup Settings' }
  ];

  for (const ep of getEndpoints) {
    const res = await fetch(`${BASE_URL}${ep.url}`, {
      headers: { 'Authorization': `Bearer ${readonlyToken}` }
    });
    assert(res.status === 200, `GET ${ep.url} (${ep.name}) returned 200 OK`);
  }

  // -------------------------------------------------------------
  // TEST 3: STRICT WRITE BLOCKING (All write methods must return 403)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Strict Write Operations Defense (Must return 403 Forbidden) ---');

  const writeAttempts = [
    {
      method: 'POST',
      url: '/api/admin/products',
      body: { title: 'Hacked Product', price: 999 },
      name: 'Add Product'
    },
    {
      method: 'PUT',
      url: '/api/admin/products/prod-123',
      body: { title: 'Modified Product' },
      name: 'Edit Product'
    },
    {
      method: 'DELETE',
      url: '/api/admin/products/prod-123',
      body: null,
      name: 'Delete Product'
    },
    {
      method: 'PATCH',
      url: '/api/admin/products/prod-123/stock',
      body: { in_stock: 0 },
      name: 'Update Stock'
    },
    {
      method: 'PATCH',
      url: '/api/admin/products/prod-123/special-section',
      body: { section: 'New Arrival' },
      name: 'Update Special Section'
    },
    {
      method: 'POST',
      url: '/api/admin/categories',
      body: { name: 'Hacked Category' },
      name: 'Create Category'
    },
    {
      method: 'PUT',
      url: '/api/admin/categories/cat-123',
      body: { name: 'Modified Category' },
      name: 'Edit Category'
    },
    {
      method: 'DELETE',
      url: '/api/admin/categories/cat-123',
      body: null,
      name: 'Delete Category'
    },
    {
      method: 'POST',
      url: '/api/admin/subcategories',
      body: { name: 'Hacked Subcategory' },
      name: 'Create Subcategory'
    },
    {
      method: 'PATCH',
      url: '/api/orders/order-123/status',
      body: { status: 'Delivered' },
      name: 'Change Order Status'
    },
    {
      method: 'POST',
      url: '/api/admin/rental-gallery',
      body: { images: [] },
      name: 'Upload Rental Photo'
    },
    {
      method: 'DELETE',
      url: '/api/admin/rental-gallery/rent-123',
      body: null,
      name: 'Delete Rental Photo'
    },
    {
      method: 'PUT',
      url: '/api/admin/store-settings/pickup',
      body: { storeName: 'Hacked Store' },
      name: 'Update Store Settings'
    },
    {
      method: 'PATCH',
      url: '/api/admin/reviews/rev-123/status',
      body: { status: 'Approved' },
      name: 'Moderate Review'
    },
    {
      method: 'DELETE',
      url: '/api/admin/reviews/rev-123',
      body: null,
      name: 'Delete Review'
    },
    {
      method: 'PATCH',
      url: '/api/admin/problems/prob-123',
      body: { status: 'Resolved' },
      name: 'Update Support Ticket'
    }
  ];

  for (const w of writeAttempts) {
    const res = await fetch(`${BASE_URL}${w.url}`, {
      method: w.method,
      headers: {
        'Authorization': `Bearer ${readonlyToken}`,
        'Content-Type': 'application/json'
      },
      body: w.body ? JSON.stringify(w.body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    assert(
      res.status === 403 && data.code === 'READ_ONLY_ACCESS_DENIED',
      `Blocked ${w.method} ${w.url} (${w.name}) -> 403 Forbidden [READ_ONLY_ACCESS_DENIED]`
    );
  }

  // -------------------------------------------------------------
  // TEST 4: Primary Owner Admin Account Intact
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Primary Owner Admin Full Access (jizajewellery@gmail.com) ---');

  const ownerStep1Res = await fetch(`${BASE_URL}/api/admin/auth/verify-credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'jizajewellery@gmail.com',
      phone: '8208822696',
      password: 'JizaAdmin@2026'
    })
  });
  const ownerStep1Data = await ownerStep1Res.json();
  assert(ownerStep1Res.status === 200 && ownerStep1Data.success === true, 'Owner: Credentials verification successful');

  const ownerStep2Res = await fetch(`${BASE_URL}/api/admin/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'jizajewellery@gmail.com',
      otp: '123456'
    })
  });
  const ownerStep2Data = await ownerStep2Res.json();
  assert(ownerStep2Res.status === 200 && ownerStep2Data.role === 'SUPER_ADMIN', 
    'Owner: OTP verification returned 200 OK with role: SUPER_ADMIN');

  const ownerToken = ownerStep2Data.token;

  // Verify owner CAN perform write operations (e.g. read and update settings)
  const ownerWriteRes = await fetch(`${BASE_URL}/api/admin/store-settings/pickup`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${ownerToken}` }
  });
  const currentSettings = await ownerWriteRes.json();
  assert(ownerWriteRes.status === 200 && currentSettings.storeName, 'Owner: Can read store settings');

  const ownerSaveRes = await fetch(`${BASE_URL}/api/admin/store-settings/pickup`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${ownerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(currentSettings)
  });
  assert(ownerSaveRes.status === 200, 'Owner: Can execute write operations (PUT /api/admin/store-settings/pickup returned 200 OK)');

  console.log('\n===========================================================');
  console.log(`📊 TOTAL RBAC AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
