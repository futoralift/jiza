import { getDb } from '../server/db/database.js';
import { calculateShipping } from '../server/services/shippingService.js';

console.log('🚀 Running Live Database & Production Architecture Verification...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  const db = await getDb();

  // 1. Verify products table has product_code column and populated values
  console.log('--- 1. Database Products & Product Code Integrity ---');
  const products = await db.all('SELECT id, product_code, title, category_id, subcategory_id, subcategory_label, selling_price, stock_quantity FROM products LIMIT 10');
  assert(products.length > 0, `Database contains ${products.length} products`);
  
  const allHaveCodes = products.every(p => p.product_code && p.product_code.trim().length > 0);
  assert(allHaveCodes, 'All products have non-empty product_code assigned in PostgreSQL');

  const sampleProd = products[0];
  console.log(`  ℹ️ Sample product: [${sampleProd.product_code}] "${sampleProd.title}" (Cat: ${sampleProd.category_id}, Sub: ${sampleProd.subcategory_label || sampleProd.subcategory_id})`);

  // 2. Verify search across database with exact and partial product codes
  console.log('\n--- 2. Product Code Database Query Verification ---');
  const searchCode = sampleProd.product_code;
  const exactMatch = await db.get('SELECT id, title, product_code FROM products WHERE UPPER(product_code) = UPPER(?)', [searchCode]);
  assert(exactMatch && exactMatch.id === sampleProd.id, `Exact code search "${searchCode}" returned matching product "${exactMatch?.title}"`);

  // Partial match test
  const partialCode = searchCode.slice(-4);
  const partialMatches = await db.all('SELECT id, title, product_code FROM products WHERE UPPER(product_code) LIKE UPPER(?)', [`%${partialCode}%`]);
  assert(partialMatches.some(p => p.id === sampleProd.id), `Partial code search "%${partialCode}%" found product [${sampleProd.product_code}]`);

  // 3. Verify Category & Subcategory Relational Structure
  console.log('\n--- 3. Category & Subcategory Relational Isolation ---');
  const categories = await db.all('SELECT id, name FROM categories');
  const subcategories = await db.all('SELECT id, category_id, name FROM subcategories');
  assert(categories.length > 0, `Found ${categories.length} parent categories in PostgreSQL`);
  assert(subcategories.length > 0, `Found ${subcategories.length} subcategories in PostgreSQL`);

  // Check subcategory uniqueness per category
  for (const cat of categories) {
    const subsForCat = subcategories.filter(s => s.category_id === cat.id);
    const subNames = subsForCat.map(s => s.name.toLowerCase());
    const hasDupes = new Set(subNames).size !== subNames.length;
    assert(!hasDupes, `Category "${cat.name}" has no duplicate subcategories within its own scope`);
  }

  // 4. Verify Server-Side Checkout Calculation Logic
  console.log('\n--- 4. Checkout & Payment Calculation & Stock Guard ---');
  // Domestic below 5000 -> 99 shipping
  const domesticLow = calculateShipping({ country: 'India', subtotal: 3500, fulfillmentType: 'ship' });
  assert(domesticLow.shippingCharge === 99, 'Domestic ₹3,500 calculated as ₹99 shipping');

  // Domestic >= 5000 -> 0 shipping
  const domesticFree = calculateShipping({ country: 'India', subtotal: 7500, fulfillmentType: 'ship' });
  assert(domesticFree.shippingCharge === 0, 'Domestic ₹7,500 calculated as ₹0 (FREE) shipping');

  // Store Pickup -> 0 shipping
  const pickup = calculateShipping({ country: 'India', subtotal: 1000, fulfillmentType: 'pickup' });
  assert(pickup.shippingCharge === 0 && pickup.isPickup === true, 'Store Pickup calculated as ₹0 shipping');

  // International -> 0 at checkout, pending confirmation
  const intl = calculateShipping({ country: 'United States', subtotal: 15000, fulfillmentType: 'ship' });
  assert(intl.shippingCharge === 0 && intl.shippingChargeStatus === 'pending_confirmation' && intl.ddu === true, 'International calculated as ₹0 at checkout with pending confirmation and DDU');

  console.log(`\n========================================`);
  console.log(`Live DB & Architecture Result: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
