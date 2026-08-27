import { useState } from 'react';

const COUNTRIES_TABLE = [
  { region: 'SAARC (South Asia)', countries: 'Bangladesh, Sri Lanka, Nepal, Pakistan, Bhutan, Maldives', estimated: '3–6 kg', days: '7–12 business days', note: 'Customs clearance required' },
  { region: 'Southeast Asia', countries: 'Singapore, Malaysia, Thailand, Indonesia, Philippines, Vietnam', estimated: '3–6 kg', days: '8–14 business days', note: 'Customs clearance required' },
  { region: 'Middle East & GCC', countries: 'UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman', estimated: '3–6 kg', days: '7–12 business days', note: 'Customs clearance required' },
  { region: 'United Kingdom', countries: 'England, Scotland, Wales, Northern Ireland', estimated: '3–6 kg', days: '10–16 business days', note: 'Post-Brexit customs duties apply' },
  { region: 'Europe (EU)', countries: 'Germany, France, Netherlands, Italy, Spain, and others', estimated: '3–6 kg', days: '10–16 business days', note: 'EU import VAT applies' },
  { region: 'North America', countries: 'USA, Canada', estimated: '3–6 kg', days: '12–18 business days', note: 'CBP customs clearance required' },
  { region: 'Australia & Oceania', countries: 'Australia, New Zealand', estimated: '3–6 kg', days: '10–16 business days', note: 'AQIS & Customs clearance required' },
  { region: 'Rest of World', countries: 'All other countries', estimated: '3–6 kg', days: '12–21 business days', note: 'Local customs rules apply' },
];

function Section({ icon, title, children, badge }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-2xl">{icon}</span>
        <h2 className="font-bold text-lg text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {title}
        </h2>
        {badge && (
          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-[#F8B3AC] text-black px-2 py-0.5 rounded-full border border-black/10">
            {badge}
          </span>
        )}
      </div>
      <div className="text-sm text-stone-700 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function InfoCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl px-4 py-3 border flex items-start gap-3 ${highlight ? 'bg-[#FFF0F2] border-[#F8B3AC]' : 'bg-white border-stone-200'}`}>
      <div>
        <div className="text-[11px] uppercase font-bold tracking-wider text-stone-500 mb-0.5">{label}</div>
        <div className="font-semibold text-stone-900 text-sm">{value}</div>
      </div>
    </div>
  );
}

export default function ShippingPolicyView({ setActiveView, previousView, onBack }) {
  const [expandedSection, setExpandedSection] = useState(null);

  const handleGoBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else if (typeof setActiveView === 'function') {
      setActiveView(previousView || 'home');
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF8F7]">
      {/* Header */}
      <div className="bg-[#FCDAD7] border-b border-black/10 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="w-9 h-9 rounded-full bg-white/80 border border-black/10 flex items-center justify-center hover:bg-white transition-all active:scale-95 cursor-pointer shadow-xs"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <h1 className="font-bold text-base text-black" style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif" }}>
                Shipping Policy
              </h1>
              <p className="text-[11px] text-stone-600">Jiza Jewellery Studio — Effective 2026</p>
            </div>
          </div>

          {previousView === 'checkout' && (
            <button
              onClick={handleGoBack}
              className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <span>Back to Checkout</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-[#2D1B14] via-[#3D241A] to-[#1a0f0a] text-white rounded-3xl p-6 md:p-8 mb-8 border border-black/20 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full -translate-y-12 translate-x-12" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#D4AF37] text-[24px]">local_shipping</span>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold mb-0.5">Official Policy</div>
                <div className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Shipping & Delivery</div>
              </div>
            </div>
            <p className="text-white/75 text-sm leading-relaxed max-w-2xl">
              Jiza Jewellery Studio ships pan-India and internationally. We are committed to delivering your precious jewellery safely and on time. Please read this policy carefully before placing your order.
            </p>
          </div>
        </div>

        {/* Quick Reference Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-2">🇮🇳</div>
            <div className="font-bold text-stone-900 text-sm mb-1">Domestic Delivery</div>
            <div className="text-[#D4AF37] font-bold text-base">₹99</div>
            <div className="text-xs text-stone-500">FREE above ₹5,000</div>
            <div className="text-xs text-stone-500 mt-1">4–10 business days</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-2">🏬</div>
            <div className="font-bold text-stone-900 text-sm mb-1">Store Pickup</div>
            <div className="text-emerald-600 font-bold text-base">FREE</div>
            <div className="text-xs text-stone-500">Ready in ~12 hours</div>
            <div className="text-xs text-stone-500 mt-1">10:30 AM – 8:00 PM</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
            <div className="text-2xl mb-2">🌎</div>
            <div className="font-bold text-stone-900 text-sm mb-1">International</div>
            <div className="text-amber-600 font-bold text-base">On Request</div>
            <div className="text-xs text-stone-500">Confirmed after packing</div>
            <div className="text-xs text-stone-500 mt-1">7–21 business days</div>
          </div>
        </div>

        {/* Main Policy Content */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-8">

          {/* Section 1: Domestic Delivery */}
          <Section icon="🇮🇳" title="Domestic Shipping — India">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <InfoCard label="Standard Shipping Fee" value="₹99 per order" />
              <InfoCard label="Free Shipping Threshold" value="Orders ₹5,000 and above" highlight />
              <InfoCard label="Delivery Estimate" value="4–10 business days" />
              <InfoCard label="Courier Partners" value="DTDC, Delhivery, BlueDart, India Post" />
            </div>
            <p>Orders within India are shipped via reliable courier partners. Tracking details will be shared via WhatsApp and email once your order is dispatched.</p>
            <p className="mt-2">Delivery times are estimates and may vary during peak seasons, festivals, and national holidays. Remote pin codes may take additional time.</p>
            <div className="mt-3 bg-[#FFF0F2] border border-[#F8B3AC]/50 rounded-xl p-3 text-xs">
              <span className="font-bold text-stone-800">📌 Note:</span> Business days exclude Sundays and public holidays. Orders placed after 3:00 PM IST are processed the next business day.
            </div>
          </Section>

          <div className="border-t border-stone-100 my-6" />

          {/* Section 2: Store Pickup */}
          <Section icon="🏬" title="Store Pickup — Jiza Studio, Pune" badge="FREE">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <InfoCard label="Pickup Charge" value="FREE — No extra cost" highlight />
              <InfoCard label="Ready for Pickup" value="Approximately 12 hours after order" />
              <InfoCard label="Studio Hours" value="10:30 AM – 8:00 PM (Tue – Sun)" />
              <InfoCard label="Collection Deadline" value="15 days from order date" />
            </div>
            <p>
              <strong>Address:</strong> Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar, Pune – 411051
            </p>
            <p className="mt-2">Upon arrival at the studio, please present your <strong>Order ID</strong> and a valid Government-issued Photo ID (Aadhar Card, PAN Card, Passport, or Driving Licence).</p>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
              <span className="font-bold text-amber-800">⚠️ Collection Deadline:</span> Orders not collected within <strong>15 calendar days</strong> of placement will be automatically released back to inventory. No refund will be issued for uncollected store pickup orders.
            </div>
          </Section>

          <div className="border-t border-stone-100 my-6" />

          {/* Section 3: International Shipping */}
          <Section icon="🌎" title="International Shipping">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📦</span>
                <div>
                  <div className="font-bold text-amber-900 mb-1">International Shipping — Charge Confirmed After Packing</div>
                  <p className="text-amber-800 text-xs leading-relaxed">
                    We do not automatically calculate the final international shipping charge at checkout because the exact shipment weight and dimensions can only be determined after your jewellery is carefully packed.
                  </p>
                  <p className="text-amber-800 text-xs leading-relaxed mt-2">
                    After your order is packed, our team will contact you by <strong>phone or WhatsApp</strong> to confirm the final shipping charge before dispatching. You are free to cancel the order at this stage with a full refund if you wish.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <InfoCard label="Payment at Checkout" value="Product subtotal only" />
              <InfoCard label="Shipping Charge" value="Confirmed after packing" highlight />
              <InfoCard label="Contact Method" value="Phone or WhatsApp" />
              <InfoCard label="Duty Arrangement" value="DDU — Delivery Duty Unpaid" />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs">
              <span className="font-bold text-red-800">🛃 DDU — Delivery Duty Unpaid:</span> All international orders are shipped on a <strong>Delivery Duty Unpaid (DDU)</strong> basis. This means all import duties, customs taxes, and local government fees applicable in your country are the sole responsibility of the recipient. Jiza Jewellery Studio cannot pre-pay or reimburse these charges.
            </div>

            {/* International Reference Table */}
            <div className="mb-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">International Shipping Reference Table</div>
              <div className="text-[11px] text-stone-500 mb-3 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                📌 This table shows estimated shipping timelines and weight ranges for reference only. The actual final charge depends on the packed weight and dimensions of your order and is confirmed by our team after packing.
              </div>
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FCDAD7] text-stone-800">
                    <tr>
                      <th className="px-3 py-2.5 font-bold">Region</th>
                      <th className="px-3 py-2.5 font-bold">Countries</th>
                      <th className="px-3 py-2.5 font-bold">Typical Weight</th>
                      <th className="px-3 py-2.5 font-bold">Est. Delivery</th>
                      <th className="px-3 py-2.5 font-bold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COUNTRIES_TABLE.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                        <td className="px-3 py-2.5 font-semibold text-stone-800 whitespace-nowrap">{row.region}</td>
                        <td className="px-3 py-2.5 text-stone-600">{row.countries}</td>
                        <td className="px-3 py-2.5 text-stone-600 whitespace-nowrap">{row.estimated}</td>
                        <td className="px-3 py-2.5 text-stone-600 whitespace-nowrap">{row.days}</td>
                        <td className="px-3 py-2.5 text-stone-500 italic">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          <div className="border-t border-stone-100 my-6" />

          {/* Section 4: Delivered but Not Received */}
          <Section icon="🔍" title="Delivered But Not Received — Investigation Policy">
            <p>If the courier's tracking system shows your parcel as <strong>"Delivered"</strong> but you have not received it, please follow this process:</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] text-stone-900 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                <div>
                  <div className="font-semibold text-stone-800 text-xs mb-1">Report Within 24–48 Hours</div>
                  <p className="text-xs text-stone-600">Contact us <strong>within 24–48 hours</strong> of the marked delivery date. Reports submitted after 48 hours may not be eligible for investigation or replacement.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] text-stone-900 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                <div>
                  <div className="font-semibold text-stone-800 text-xs mb-1">Mandatory Verification</div>
                  <p className="text-xs text-stone-600">You must confirm: (a) Your complete delivery address is correct, (b) You have checked with neighbours, security guard, and building reception, and (c) You have checked all common access areas of your premises.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] text-stone-900 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                <div>
                  <div className="font-semibold text-stone-800 text-xs mb-1">Courier Investigation (5–7 Working Days)</div>
                  <p className="text-xs text-stone-600">We will lodge a formal dispute with the courier company. Investigation typically takes <strong>5–7 working days</strong>. We will keep you updated throughout the process.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-xl p-3">
                <div className="w-7 h-7 rounded-full bg-[#FCDAD7] border border-[#F8B3AC] text-stone-900 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                <div>
                  <div className="font-semibold text-stone-800 text-xs mb-1">Investigation Outcomes</div>
                  <p className="text-xs text-stone-600">
                    <strong>• Courier confirms delivery error:</strong> Replacement jewellery will be dispatched at no cost.<br />
                    <strong>• Courier provides delivery proof:</strong> Delivery proof (photo/signature) will be shared with you for your records.<br />
                    <strong>• Inconclusive investigation:</strong> Assessed case by case; a resolution will be offered at our discretion.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
              <span className="font-bold text-red-800">❌ No Refund / Replacement in These Cases:</span>
              <ul className="mt-1.5 space-y-1 text-red-700 list-disc list-inside">
                <li>Incorrect delivery address provided at checkout</li>
                <li>Parcel refused at delivery by recipient or household member</li>
                <li>Delivered to an authorised person at the address (family, colleague, security)</li>
                <li>Report submitted after the 48-hour complaint window</li>
                <li>International orders where customs have confiscated or returned the parcel</li>
              </ul>
            </div>
          </Section>

          <div className="border-t border-stone-100 my-6" />

          {/* Contact */}
          <div className="bg-[#FCDAD7]/50 rounded-2xl p-5 border border-[#F8B3AC]/40">
            <div className="font-bold text-stone-900 mb-2 text-sm">📞 Shipping & Delivery Queries</div>
            <p className="text-xs text-stone-700 mb-3">For any shipping or delivery related query, please contact us:</p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://wa.me/918208822696"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#1EBE57] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                WhatsApp Us
              </a>
              <a
                href="tel:+918208822696"
                className="flex items-center gap-2 bg-stone-900 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">call</span>
                +91 82088 22696
              </a>
              <a
                href="mailto:jizajewellery@gmail.com"
                className="flex items-center gap-2 bg-white border border-stone-200 text-stone-800 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">mail</span>
                Email Us
              </a>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-[11px] text-stone-400">
            This policy is effective from 1 January 2026 and applies to all orders placed on the Jiza Jewellery Studio website.<br />
            Jiza Jewellery Studio reserves the right to update this policy at any time. The latest version is always available on this page.
          </div>
        </div>
      </div>
    </main>
  );
}
