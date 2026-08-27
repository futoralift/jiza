/**
 * Jiza Jewellery Studio — Centralized Shipping Service
 * 
 * CRITICAL RULE: International shipping charges are NEVER automatically calculated.
 * The final international shipping charge is confirmed after packing by calling the customer.
 * 
 * Domestic (India):
 *   - Below ₹5,000: ₹99 shipping
 *   - ₹5,000 and above: FREE shipping
 *   - Store Pickup: FREE (₹0)
 * 
 * International (non-India):
 *   - Shipping charge status: PENDING_CONFIRMATION
 *   - Customer is contacted after packing
 */

// Default shipping configuration (overridden by DB store_settings when available)
const DEFAULT_SHIPPING_CONFIG = {
  domestic: {
    standardFee: 99,
    freeThreshold: 5000,
    deliveryEstimate: '4–10 business days',
    enabled: true
  },
  pickup: {
    enabled: true,
    prepTime: 'approximately 12 hours',
    hours: '10:30 AM – 8:00 PM',
    collectionDeadlineDays: 15
  },
  international: {
    enabled: true,
    deliveryEstimate: '7–12 business days',
    ddu: true,
    note: 'Final shipping charge confirmed after packing. Customer contacted by phone or WhatsApp.'
  }
};

/**
 * Determine if a country code/name is India.
 * Accepts: 'India', 'IN', 'india', 'INDIA' etc.
 */
function isIndia(country) {
  if (!country) return true; // default to domestic if not specified
  const c = country.toString().trim().toLowerCase();
  return c === 'india' || c === 'in';
}

/**
 * Calculate shipping for an order.
 * 
 * @param {object} params
 * @param {string} params.country - Destination country name or ISO code
 * @param {number} params.subtotal - Product subtotal in INR (before shipping)
 * @param {string} params.fulfillmentType - 'ship' | 'pickup' | 'international'
 * @param {object} [params.config] - Optional override shipping config from DB
 * 
 * @returns {object} Shipping result
 */
export function calculateShipping({ country = 'India', subtotal = 0, fulfillmentType = 'ship', config = null }) {
  const cfg = config || DEFAULT_SHIPPING_CONFIG;
  const sub = Number(subtotal) || 0;

  // === STORE PICKUP ===
  if (fulfillmentType === 'pickup') {
    return {
      method: 'store_pickup',
      fulfillmentType: 'pickup',
      shippingCharge: 0,
      shippingChargeStatus: 'calculated',
      isFreeShipping: true,
      isPickup: true,
      isInternational: false,
      deliveryEstimate: `Ready in ${cfg.pickup?.prepTime || 'approximately 12 hours'}`,
      pickupHours: cfg.pickup?.hours || '10:30 AM – 8:00 PM',
      collectionDeadlineDays: cfg.pickup?.collectionDeadlineDays || 15,
      displayLabel: 'Store Pickup — FREE',
      shippingPolicyVersion: 'v1'
    };
  }

  // === INTERNATIONAL SHIPPING ===
  if (!isIndia(country)) {
    // NEVER auto-calculate international shipping.
    // Always return pending_confirmation.
    return {
      method: 'international_standard',
      fulfillmentType: 'international',
      shippingCharge: 0, // Not collected at checkout — pending confirmation
      shippingChargeStatus: 'pending_confirmation',
      isFreeShipping: false,
      isPickup: false,
      isInternational: true,
      deliveryEstimate: cfg.international?.deliveryEstimate || '7–12 business days',
      ddu: true,
      displayLabel: 'International Shipping — Final Charge To Be Confirmed',
      pendingConfirmationNote: 'Your final international shipping charge will be confirmed after your order is packed. Our team will contact you by phone or WhatsApp to confirm the shipping cost.',
      shippingPolicyVersion: 'v1'
    };
  }

  // === DOMESTIC SHIPPING (India) ===
  const standardFee = Number(cfg.domestic?.standardFee ?? 99);
  const freeThreshold = Number(cfg.domestic?.freeThreshold ?? 5000);
  const isFree = sub >= freeThreshold;
  const charge = isFree ? 0 : standardFee;

  return {
    method: 'standard',
    fulfillmentType: 'ship',
    shippingCharge: charge,
    shippingChargeStatus: 'calculated',
    isFreeShipping: isFree,
    isPickup: false,
    isInternational: false,
    deliveryEstimate: cfg.domestic?.deliveryEstimate || '4–10 business days',
    freeThreshold,
    standardFee,
    displayLabel: isFree ? 'Standard Delivery — FREE' : `Standard Delivery — ₹${charge}`,
    shippingPolicyVersion: 'v1'
  };
}

/**
 * Load shipping settings from DB store_settings.
 * Falls back to DEFAULT_SHIPPING_CONFIG if not found.
 */
export async function getShippingConfig(db) {
  try {
    const row = await db.get("SELECT value_json FROM store_settings WHERE key = 'shipping_settings'");
    if (row && row.value_json) {
      const parsed = JSON.parse(row.value_json);
      // Deep merge with defaults to handle missing keys
      return {
        domestic: { ...DEFAULT_SHIPPING_CONFIG.domestic, ...(parsed.domestic || {}) },
        pickup: { ...DEFAULT_SHIPPING_CONFIG.pickup, ...(parsed.pickup || {}) },
        international: { ...DEFAULT_SHIPPING_CONFIG.international, ...(parsed.international || {}) }
      };
    }
  } catch (err) {
    console.error('[ShippingService] Error loading shipping config:', err.message);
  }
  return DEFAULT_SHIPPING_CONFIG;
}

/**
 * Save shipping settings to DB store_settings.
 */
export async function saveShippingConfig(db, config) {
  // Validate key values before saving
  const validated = {
    domestic: {
      standardFee: Math.max(0, Number(config.domestic?.standardFee ?? 99)),
      freeThreshold: Math.max(0, Number(config.domestic?.freeThreshold ?? 5000)),
      deliveryEstimate: String(config.domestic?.deliveryEstimate || '4–10 business days').slice(0, 100),
      enabled: Boolean(config.domestic?.enabled !== false)
    },
    pickup: {
      enabled: Boolean(config.pickup?.enabled !== false),
      prepTime: String(config.pickup?.prepTime || 'approximately 12 hours').slice(0, 100),
      hours: String(config.pickup?.hours || '10:30 AM – 8:00 PM').slice(0, 100),
      collectionDeadlineDays: Math.max(1, Math.min(90, Number(config.pickup?.collectionDeadlineDays ?? 15)))
    },
    international: {
      enabled: Boolean(config.international?.enabled !== false),
      deliveryEstimate: String(config.international?.deliveryEstimate || '7–12 business days').slice(0, 100),
      ddu: true, // Always DDU — cannot be changed
      note: String(config.international?.note || 'Final shipping charge confirmed after packing.').slice(0, 500)
    }
  };

  await db.run(
    `INSERT INTO store_settings (key, value_json, updated_at)
     VALUES ('shipping_settings', ?, CURRENT_TIMESTAMP)
     ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(validated)]
  );

  return validated;
}

export { DEFAULT_SHIPPING_CONFIG, isIndia };
