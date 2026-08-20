import React from 'react';

export default function CustomerDetailsModal({
  selectedCustomerDetails,
  setSelectedCustomerDetails,
  getCustomerOrders,
  calculateCustomerTotalSpent,
  setSelectedOrderDetails
}) {
  if (!selectedCustomerDetails) return null;

  const custOrders = typeof getCustomerOrders === 'function' ? getCustomerOrders(selectedCustomerDetails) : [];
  const totalSpent = typeof calculateCustomerTotalSpent === 'function' ? calculateCustomerTotalSpent(custOrders) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-onyx/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FFF9F9] text-on-surface border border-[#F7C5C0] rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedCustomerDetails(null)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors z-10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>

        {/* Header Banner */}
        <div className="bg-[#FCDAD7] text-black rounded-2xl p-6 border border-black/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-black p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-[#FCDAD7]">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline-sm text-lg font-bold text-black">
                  {selectedCustomerDetails.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-black/10 border border-black/20 text-black font-mono text-xs font-bold rounded-full">
                  {selectedCustomerDetails.id}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-stone-800 flex-wrap font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">mail</span>
                  {selectedCustomerDetails.email}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">call</span>
                  {selectedCustomerDetails.phone}
                </span>
              </div>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-full">
            ✓ Verified Account
          </span>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <div className="bg-white p-3.5 rounded-xl border border-outline-variant/30 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Customer ID</span>
            <span className="font-mono text-xs font-bold text-black block mt-0.5">{selectedCustomerDetails.id}</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-outline-variant/30 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Total Orders</span>
            <span className="font-headline-sm text-lg font-bold text-on-surface block mt-0.5">{custOrders.length}</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Amount Spent</span>
            <span className="font-headline-sm text-lg font-bold text-emerald-700 block mt-0.5">
              ₹{totalSpent.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-outline-variant/30 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Registration Date</span>
            <span className="text-xs font-bold text-on-surface block mt-0.5">{selectedCustomerDetails.joinedDate || 'Recent'}</span>
          </div>

        </div>

        {/* BASIC INFORMATION CARD */}
        <div className="bg-white p-5 rounded-2xl border border-[#F7C5C0] shadow-xs space-y-3 text-xs">
          <h4 className="font-bold text-sm text-on-surface border-b border-outline-variant/20 pb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-black text-base">info</span>
            Basic Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            <div>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Customer ID</span>
              <span className="font-mono font-bold text-on-surface text-xs">{selectedCustomerDetails.id}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Full Name</span>
              <span className="font-bold text-on-surface text-xs">{selectedCustomerDetails.name}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Email Address</span>
              <span className="font-bold text-on-surface text-xs">{selectedCustomerDetails.email}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Phone Number</span>
              <span className="font-bold text-on-surface text-xs">{selectedCustomerDetails.phone}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant block">Default Shipping Address</span>
              <span className="font-semibold text-on-surface text-xs">
                {selectedCustomerDetails.address 
                  ? `${selectedCustomerDetails.address}${selectedCustomerDetails.city ? ', ' + selectedCustomerDetails.city : ''}${selectedCustomerDetails.pincode ? ' - ' + selectedCustomerDetails.pincode : ''}` 
                  : 'Flat 101, Dream Meadows, Pune - 411051'}
              </span>
            </div>
          </div>
        </div>

        {/* ORDER HISTORY TABLE */}
        <div className="bg-white p-5 rounded-2xl border border-[#F7C5C0] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-black text-base">history</span>
              Order History ({custOrders.length})
            </h4>
          </div>

          {custOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-xs italic">
              No orders recorded for this customer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FCDAD7] text-black font-label-sm uppercase text-[10px] border-b border-black/20">
                  <tr>
                    <th className="p-2.5 font-bold">Order ID</th>
                    <th className="p-2.5 font-bold">Order Date</th>
                    <th className="p-2.5 font-bold">Products Ordered</th>
                    <th className="p-2.5 font-bold">Order Amount</th>
                    <th className="p-2.5 font-bold">Payment Status</th>
                    <th className="p-2.5 font-bold">Order Status</th>
                    <th className="p-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {custOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FFF0F2]">
                      <td className="p-2.5 font-mono font-bold text-black">{o.id}</td>
                      <td className="p-2.5 font-medium text-on-surface-variant">{o.date || 'Recent'}</td>
                      <td className="p-2.5 max-w-[180px] truncate font-medium">{o.items || 'Jewellery Items'}</td>
                      <td className="p-2.5 font-bold text-on-surface">{o.amount}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-300">
                          Paid ({o.paymentMethod || 'UPI'})
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          o.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {o.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => setSelectedOrderDetails(o)}
                          className="px-2.5 py-1 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-[10px] rounded-lg shadow-xs border border-black/20 cursor-pointer"
                        >
                          View Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end pt-2 border-t border-outline-variant/20">
          <button
            onClick={() => setSelectedCustomerDetails(null)}
            className="px-6 py-2.5 bg-[#FCDAD7] text-black font-bold text-xs rounded-xl shadow border border-black/20 hover:bg-[#F9C5C0] transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
