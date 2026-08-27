import { calculateShipping, isIndia } from '../server/services/shippingService.js';

console.log('🧪 Running Shipping Service Unit Tests...\n');

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

// Test 1: Domestic India below ₹5,000
{
  const res = calculateShipping({ country: 'India', subtotal: 4999, fulfillmentType: 'ship' });
  assert(res.shippingCharge === 99, 'Domestic below ₹5,000 has ₹99 shipping charge');
  assert(res.shippingChargeStatus === 'calculated', 'Domestic status is calculated');
  assert(res.isFreeShipping === false, 'Domestic below ₹5,000 is not free');
  assert(res.isInternational === false, 'Domestic is not international');
  assert(res.deliveryEstimate === '4–10 business days', 'Domestic delivery estimate is 4–10 business days');
}

// Test 2: Domestic India at/above ₹5,000
{
  const res = calculateShipping({ country: 'India', subtotal: 5000, fulfillmentType: 'ship' });
  assert(res.shippingCharge === 0, 'Domestic ₹5,000 has ₹0 (FREE) shipping charge');
  assert(res.shippingChargeStatus === 'calculated', 'Domestic status is calculated');
  assert(res.isFreeShipping === true, 'Domestic ₹5,000 is free');
}

// Test 3: Store Pickup
{
  const res = calculateShipping({ country: 'India', subtotal: 1500, fulfillmentType: 'pickup' });
  assert(res.shippingCharge === 0, 'Store pickup has ₹0 shipping charge');
  assert(res.isPickup === true, 'Store pickup isPickup is true');
  assert(res.isFreeShipping === true, 'Store pickup is free');
}

// Test 4: International Shipping (USA)
{
  const res = calculateShipping({ country: 'United States', subtotal: 12000, fulfillmentType: 'ship' });
  assert(res.shippingCharge === 0, 'International shipping charge at checkout is 0 (pending confirmation)');
  assert(res.shippingChargeStatus === 'pending_confirmation', 'International shipping status is pending_confirmation');
  assert(res.isInternational === true, 'isInternational is true for United States');
  assert(res.ddu === true, 'International delivery is marked DDU');
  assert(res.deliveryEstimate === '7–12 business days', 'International delivery estimate is 7–12 business days');
}

// Test 5: International Shipping (UAE / Dubai)
{
  const res = calculateShipping({ country: 'United Arab Emirates', subtotal: 8500, fulfillmentType: 'ship' });
  assert(res.shippingChargeStatus === 'pending_confirmation', 'UAE order is pending_confirmation');
  assert(res.isInternational === true, 'UAE is international');
}

// Test 6: isIndia helper
{
  assert(isIndia('India') === true, 'isIndia("India") is true');
  assert(isIndia('india') === true, 'isIndia("india") is true');
  assert(isIndia('IN') === true, 'isIndia("IN") is true');
  assert(isIndia('USA') === false, 'isIndia("USA") is false');
  assert(isIndia('United Kingdom') === false, 'isIndia("United Kingdom") is false');
  assert(isIndia(null) === true, 'isIndia(null) defaults to true (domestic fallback)');
}

console.log(`\n========================================`);
console.log(`Result: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
