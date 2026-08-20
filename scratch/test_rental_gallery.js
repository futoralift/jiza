import 'dotenv/config';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'jiza-studio-enterprise-secret-key-998877665544332211';

async function runRentalGalleryTests() {
  console.log('===========================================================');
  console.log('🧪 RUNNING COMPREHENSIVE RENTAL GALLERY CMS TEST SUITE');
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
  const validAdminToken = jwt.sign(
    { email: 'jizajewellery@gmail.com', role: 'admin', authorizedAt: Date.now() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  try {
    // -------------------------------------------------------------
    // TEST 1: Public Rental Gallery API & Default Seeding
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Public Rental Gallery API & Auto-Seeding ---');
    const publicRes = await fetch(`${API_BASE}/api/rental-gallery`);
    const publicData = await publicRes.json();
    assert(publicRes.status === 200 && publicData.success === true, 'Public GET /api/rental-gallery returned 200 OK');
    assert(publicData.count >= 10, `Initial rental gallery seeded with ${publicData.count} images (>= 10 sets preserved)`);

    // -------------------------------------------------------------
    // TEST 2: Admin Protected GET Endpoint
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Admin Protected Rental Gallery Endpoint ---');
    const adminGetRes = await fetch(`${API_BASE}/api/admin/rental-gallery`, {
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const adminGetData = await adminGetRes.json();
    assert(adminGetRes.status === 200 && adminGetData.success === true, 'Admin GET /api/admin/rental-gallery returned 200 OK');

    // -------------------------------------------------------------
    // TEST 3: Multi-Image Upload via Admin API
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Multi-Image Upload (Image-Only CMS) ---');
    const sampleBase64 = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v3AgAA=';
    const uploadRes = await fetch(`${API_BASE}/api/admin/rental-gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({
        images: [sampleBase64, sampleBase64, sampleBase64]
      })
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 201 && uploadData.count === 3, 'Multi-image upload (3 images) succeeded with 201 Created');
    assert(uploadData.message === 'Images uploaded successfully.', 'Returned exact success message "Images uploaded successfully."');

    // -------------------------------------------------------------
    // TEST 4: Dynamic Set Count Increase
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Customer-Facing Dynamic Set Count Increase ---');
    const publicRes2 = await fetch(`${API_BASE}/api/rental-gallery`);
    const publicData2 = await publicRes2.json();
    const expectedCount = publicData.count + 3;
    assert(publicData2.count === expectedCount, `Customer gallery count dynamically updated from ${publicData.count} to ${publicData2.count} Sets`);

    // -------------------------------------------------------------
    // TEST 5: Security Protection (Unauthenticated Upload Blocked)
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Unauthenticated Upload Rejection ---');
    const unauthUploadRes = await fetch(`${API_BASE}/api/admin/rental-gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: [sampleBase64] })
    });
    assert(unauthUploadRes.status === 401, 'Unauthenticated upload attempt blocked with 401 Unauthorized');

    // -------------------------------------------------------------
    // TEST 6: Admin Delete Image & Count Decrease
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Admin Delete Image & Dynamic Count Decrease ---');
    const uploadedItemId = uploadData.items[0].id;
    const deleteRes = await fetch(`${API_BASE}/api/admin/rental-gallery/${uploadedItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${validAdminToken}` }
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteData.success === true, `Successfully deleted rental image '${uploadedItemId}'`);

    const publicRes3 = await fetch(`${API_BASE}/api/rental-gallery`);
    const publicData3 = await publicRes3.json();
    assert(publicData3.count === expectedCount - 1, `Customer gallery count dynamically decreased to ${publicData3.count} Sets`);

    // Clean up remaining test uploaded images
    for (let i = 1; i < uploadData.items.length; i++) {
      await fetch(`${API_BASE}/api/admin/rental-gallery/${uploadData.items[i].id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${validAdminToken}` }
      });
    }

    // -------------------------------------------------------------
    // TEST 7: Isolation Verification (Products Catalog Untouched)
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Product Catalog Isolation ---');
    const productsRes = await fetch(`${API_BASE}/api/products`);
    const productsList = await productsRes.json();
    assert(Array.isArray(productsList) && productsList.length > 0, `Product catalog intact with ${productsList.length} products unaffected`);

  } catch (err) {
    console.error('Test Suite Runtime Error:', err);
    testFailed++;
  }

  console.log('\n===========================================================');
  console.log(`📊 TEST RESULTS: ${testPassed} PASSED | ${testFailed} FAILED`);
  console.log('===========================================================');
}

runRentalGalleryTests();
