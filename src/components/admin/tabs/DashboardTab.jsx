import React from 'react';

export default function DashboardTab({
  totalRevenue = 0,
  ordersList = [],
  productsList = [],
  totalCategoriesCount = 0,
  totalSubCategoriesCount = 0,
  customersList = [],
  topSellingProducts = []
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* KPI Cards Row (6 Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-sm hover:border-heritage-gold/50 transition-colors">
          <div className="flex items-center justify-between text-primary mb-1">
            <span className="material-symbols-outlined text-xl">payments</span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>
          <h3 className="text-[11px] text-on-surface-variant uppercase font-label-sm tracking-wider font-semibold">Total Revenue</h3>
          <p className="font-mono text-xl font-extrabold text-primary mt-1 tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-sm hover:border-heritage-gold/50 transition-colors">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>
          <h3 className="text-[11px] text-on-surface-variant uppercase font-label-sm tracking-wider font-semibold">Total Orders</h3>
          <p className="font-mono text-xl font-extrabold text-on-surface mt-1 tracking-tight">{ordersList.length}</p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-sm hover:border-heritage-gold/50 transition-colors">
          <div className="flex items-center justify-between text-blue-700 mb-1">
            <span className="material-symbols-outlined text-xl">diamond</span>
            <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <h3 className="text-[11px] text-on-surface-variant uppercase font-label-sm tracking-wider font-semibold">Total Products</h3>
          <p className="font-mono text-xl font-extrabold text-on-surface mt-1 tracking-tight">{productsList.length}</p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-sm hover:border-heritage-gold/50 transition-colors">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="material-symbols-outlined text-xl">grid_view</span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
              Catalog
            </span>
          </div>
          <h3 className="text-[11px] text-on-surface-variant uppercase font-label-sm tracking-wider font-semibold">Total Categories</h3>
          <p className="font-mono text-xl font-extrabold text-on-surface mt-1 tracking-tight">{totalCategoriesCount}</p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-sm hover:border-heritage-gold/50 transition-colors">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="material-symbols-outlined text-xl">category</span>
            <span className="text-[10px] text-purple-800 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
              Sub Types
            </span>
          </div>
          <h3 className="text-[11px] text-on-surface-variant uppercase font-label-sm tracking-wider font-semibold">Sub Categories</h3>
          <p className="font-mono text-xl font-extrabold text-on-surface mt-1 tracking-tight">{totalSubCategoriesCount}</p>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-4 shadow-sm hover:border-heritage-gold/50 transition-colors">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="material-symbols-outlined text-xl">groups</span>
            <span className="text-[10px] text-rose-800 font-bold bg-rose-100 px-1.5 py-0.5 rounded">
              Registered
            </span>
          </div>
          <h3 className="text-[11px] text-on-surface-variant uppercase font-label-sm tracking-wider font-semibold">Customers</h3>
          <p className="font-mono text-xl font-extrabold text-on-surface mt-1 tracking-tight">{customersList.length}</p>
        </div>

      </div>

      {/* Main Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/40 p-6 shadow-sm">
          <h3 className="font-headline-sm text-base text-on-surface font-bold mb-4">Recent Orders</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface">
              <thead className="bg-[#FCDAD7]/60 text-black font-label-sm uppercase text-[10px] border-b border-[#F7C5C0]">
                <tr>
                  <th className="p-3 font-semibold">Order ID</th>
                  <th className="p-3 font-semibold">Customer</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {ordersList.slice(0, 6).map(o => (
                  <tr key={o.id} className="hover:bg-[#FFF0F2] transition-colors">
                    <td className="p-3 font-bold text-primary">{o.id}</td>
                    <td className="p-3 font-semibold">{o.customerName || 'Customer'}</td>
                    <td className="p-3 text-on-surface-variant">{o.date || 'Today'}</td>
                    <td className="p-3 font-bold text-primary">{o.amount}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        o.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        o.status === 'Processing' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        o.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Top Selling Products */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/40 p-6 shadow-sm space-y-4">
          <h3 className="font-headline-sm text-base text-on-surface font-bold">Top Selling Products</h3>
          
          <div className="space-y-3">
            {topSellingProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-antique-cream/40 transition-colors">
                <img 
                  src={p.img} 
                  alt={p.title} 
                  className="w-12 h-12 rounded-lg object-cover bg-antique-cream border border-outline-variant/30 shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-on-surface truncate">{p.title}</h4>
                  <p className="text-[10px] text-on-surface-variant capitalize">{p.categoryLabel || p.category}</p>
                  <p className="text-[11px] font-bold text-primary">₹{Number(p.price || p.sellingPrice || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {p.soldCount || p.sold_count || 0} sold
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
