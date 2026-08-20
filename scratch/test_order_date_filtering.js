import 'dotenv/config';
import jwt from 'jsonwebtoken';

const API_BASE = 'http://localhost:5000';
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'jiza-studio-enterprise-secret-key-998877665544332211';

async function runOrderDateFilteringTests() {
  console.log('===========================================================');
  console.log('🧪 RUNNING HARDENED ORDER DATE RANGE FILTERING TEST SUITE');
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
    // Current IST Time calculation
    const nowUtc = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const nowIst = new Date(nowUtc.getTime() + istOffsetMs);

    const year = nowIst.getUTCFullYear();
    const month = nowIst.getUTCMonth();
    const day = nowIst.getUTCDate();

    // Calculate exact IST boundaries in UTC ISO strings
    const todayStartIstMs = Date.UTC(year, month, day, 0, 0, 0, 0);
    const todayStartUtcIso = new Date(todayStartIstMs - istOffsetMs).toISOString();
    const todayEndUtcIso = new Date(todayStartIstMs + (24 * 60 * 60 * 1000) - istOffsetMs).toISOString();

    const yesterdayStartUtcIso = new Date(todayStartIstMs - (24 * 60 * 60 * 1000) - istOffsetMs).toISOString();
    const yesterdayEndUtcIso = todayStartUtcIso;

    console.log(`\n📅 Business Timezone: Asia/Kolkata (IST)`);
    console.log(`   Current IST Time: ${nowIst.toUTCString().replace('GMT', 'IST')}`);
    console.log(`   Today IST Range (UTC): [${todayStartUtcIso} to ${todayEndUtcIso})`);
    console.log(`   Yesterday IST Range (UTC): [${yesterdayStartUtcIso} to ${yesterdayEndUtcIso})`);

    // -------------------------------------------------------------
    // TEST 1: GET /api/orders with preset=today
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Backend GET /api/orders?preset=today ---');
    const todayRes = await fetch(`${API_BASE}/api/orders?preset=today`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const todayOrders = await todayRes.json();
    assert(todayRes.status === 200 && Array.isArray(todayOrders), 'GET /api/orders?preset=today returned 200 OK');
    
    // Verify all returned orders strictly fall within Today IST range
    let allTodayValid = true;
    for (const o of todayOrders) {
      const orderMs = new Date(o.created_at).getTime();
      const startMs = new Date(todayStartUtcIso).getTime();
      const endMs = new Date(todayEndUtcIso).getTime();
      if (orderMs < startMs || orderMs >= endMs) {
        allTodayValid = false;
        console.error(`  Invalid order in today filter: ID=${o.id}, created_at=${o.created_at}`);
      }
    }
    assert(allTodayValid, 'All orders returned under Today preset fall strictly within today\'s IST calendar boundaries');

    // -------------------------------------------------------------
    // TEST 2: GET /api/orders with preset=yesterday
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Backend GET /api/orders?preset=yesterday ---');
    const yesterdayRes = await fetch(`${API_BASE}/api/orders?preset=yesterday`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const yesterdayOrders = await yesterdayRes.json();
    assert(yesterdayRes.status === 200 && Array.isArray(yesterdayOrders), 'GET /api/orders?preset=yesterday returned 200 OK');

    let allYesterdayValid = true;
    for (const o of yesterdayOrders) {
      const orderMs = new Date(o.created_at).getTime();
      const startMs = new Date(yesterdayStartUtcIso).getTime();
      const endMs = new Date(yesterdayEndUtcIso).getTime();
      if (orderMs < startMs || orderMs >= endMs) {
        allYesterdayValid = false;
        console.error(`  Invalid order in yesterday filter: ID=${o.id}, created_at=${o.created_at}`);
      }
    }
    assert(allYesterdayValid, 'All orders returned under Yesterday preset fall strictly within yesterday\'s IST calendar boundaries');

    // -------------------------------------------------------------
    // TEST 3: Midnight Edge Case Test
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Midnight Edge Case Boundary Test (00:15:00 IST Order) ---');
    const midnightIstMs = todayStartIstMs + (15 * 60 * 1000); // 00:15:00 IST today
    const midnightUtcIso = new Date(midnightIstMs - istOffsetMs).toISOString();

    const startMs = new Date(todayStartUtcIso).getTime();
    const endMs = new Date(todayEndUtcIso).getTime();
    const midnightMs = new Date(midnightUtcIso).getTime();

    const isToday = midnightMs >= startMs && midnightMs < endMs;
    const yestStartMs = new Date(yesterdayStartUtcIso).getTime();
    const yestEndMs = new Date(yesterdayEndUtcIso).getTime();
    const isYesterday = midnightMs >= yestStartMs && midnightMs < yestEndMs;

    assert(isToday && !isYesterday, `Order at 00:15 IST (${midnightUtcIso}) is classified as Today and NOT Yesterday`);

    // -------------------------------------------------------------
    // TEST 4: Last 7 Days Preset Test
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Last 7 Days Preset Test ---');
    const last7Res = await fetch(`${API_BASE}/api/orders?preset=last7`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const last7Orders = await last7Res.json();
    assert(last7Res.status === 200 && Array.isArray(last7Orders), 'GET /api/orders?preset=last7 returned 200 OK');

    // -------------------------------------------------------------
    // TEST 5: Combined Date + Status Filter Test
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Combined Date (thisMonth) + Status (Delivered) Filter Test ---');
    const combinedRes = await fetch(`${API_BASE}/api/orders?preset=thisMonth&status=Delivered`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const combinedOrders = await combinedRes.json();
    assert(combinedRes.status === 200 && Array.isArray(combinedOrders), 'GET /api/orders?preset=thisMonth&status=Delivered returned 200 OK');
    const allDelivered = combinedOrders.every(o => o.status === 'Delivered');
    assert(allDelivered, 'All orders in combined filter match status Delivered');

    // -------------------------------------------------------------
    // TEST 6: Custom Date Range Inclusion Test
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Custom Date Range Inclusion Test ---');
    const customStart = '2026-08-01';
    const customEnd = '2026-08-13';
    const customRes = await fetch(`${API_BASE}/api/orders?preset=custom&startDate=${customStart}&endDate=${customEnd}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const customOrders = await customRes.json();
    assert(customRes.status === 200 && Array.isArray(customOrders), `GET /api/orders?preset=custom (${customStart} to ${customEnd}) returned 200 OK`);

  } catch (err) {
    console.error('Test Suite Error:', err);
    testFailed++;
  }

  console.log('\n===========================================================');
  console.log(`📊 TEST RESULTS: ${testPassed} PASSED | ${testFailed} FAILED`);
  console.log('===========================================================');
}

runOrderDateFilteringTests();
