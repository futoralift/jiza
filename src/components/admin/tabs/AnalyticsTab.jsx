import React from 'react';

export default function AnalyticsTab({
  analyticsPreset,
  setAnalyticsPreset,
  currentAnalytics,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  maxRevenueInChart,
  maxUnitsInChart
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* DATE RANGE FILTERING BAR */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-headline-sm text-base text-black font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-black">calendar_month</span>
              <span>Analytics Date Range Filter</span>
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {currentAnalytics.label}
            </p>
          </div>

          {/* Preset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAnalyticsPreset('7days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all ${
                analyticsPreset === '7days'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Last 7 Days
            </button>

            <button
              onClick={() => setAnalyticsPreset('30days')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all ${
                analyticsPreset === '30days'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Last 30 Days
            </button>

            <button
              onClick={() => setAnalyticsPreset('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all ${
                analyticsPreset === 'month'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => setAnalyticsPreset('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all ${
                analyticsPreset === 'custom'
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-[#FCDAD7]/30 text-stone-800 hover:bg-[#FCDAD7]/60'
              }`}
            >
              Custom Date Range 📅
            </button>
          </div>
        </div>

        {/* Custom Date Inputs when 'custom' is selected */}
        {analyticsPreset === 'custom' && (
          <div className="pt-3 border-t border-outline-variant/30 flex flex-wrap items-center gap-4 bg-[#F9F6F0] p-3 rounded-xl">
            <div className="flex items-center space-x-2 text-xs">
              <label className="font-bold text-on-surface">Start Date:</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <label className="font-bold text-on-surface">End Date:</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-black font-semibold"
              />
            </div>
          </div>
        )}
      </div>

      {/* FILTERED SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-black mb-1">
            <span className="material-symbols-outlined text-2xl text-black">payments</span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
              Revenue Trend
            </span>
          </div>
          <p className="text-xs text-on-surface-variant uppercase font-label-sm font-semibold">Period Revenue</p>
          <h4 className="font-mono text-2xl font-extrabold text-black tracking-tight mt-1">₹{currentAnalytics.totalRev.toLocaleString('en-IN')}</h4>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
              Units Sold
            </span>
          </div>
          <p className="text-xs text-on-surface-variant uppercase font-label-sm font-semibold">Total Products Sold</p>
          <h4 className="font-mono text-2xl font-extrabold text-on-surface tracking-tight mt-1">{currentAnalytics.totalUnits} Items</h4>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-purple-700 mb-1">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
            <span className="text-[10px] text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded">
              Average Ticket
            </span>
          </div>
          <p className="text-xs text-on-surface-variant uppercase font-label-sm font-semibold">Avg Order Value</p>
          <h4 className="font-mono text-2xl font-extrabold text-on-surface tracking-tight mt-1">₹{currentAnalytics.avgOrder.toLocaleString('en-IN')}</h4>
        </div>
      </div>

      {/* VISUAL CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. REVENUE CHART OVER TIME */}
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-base text-on-surface font-bold">Revenue Chart over Dates</h3>
              <p className="text-xs text-on-surface-variant">Daily sales breakdown for the selected period</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              ₹{currentAnalytics.totalRev.toLocaleString('en-IN')} Total
            </span>
          </div>

          {/* Visual Bar Chart */}
          <div className="pt-6 pb-2">
            {currentAnalytics.chartData && currentAnalytics.chartData.length > 0 ? (
              <>
                <div className="h-48 flex items-end justify-between gap-3 border-b border-outline-variant/30 px-2">
                  {currentAnalytics.chartData.map((d, i) => {
                    const pct = Math.round((d.rev / maxRevenueInChart) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[#FCDAD7] text-[10px] font-bold py-1 px-2 rounded shadow whitespace-nowrap z-20 pointer-events-none">
                          ₹{d.rev.toLocaleString('en-IN')} ({d.units} sold)
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-[#F8B3AC] to-[#FCDAD7] border border-black/15 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-sm"
                          style={{ height: `${Math.max(pct, 12)}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between gap-3 px-2 mt-2 text-[10px] text-on-surface-variant font-bold">
                  {currentAnalytics.chartData.map((d, i) => (
                    <span key={i} className="flex-1 text-center truncate">{d.day}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-stone-400">
                <span className="material-symbols-outlined text-3xl mb-1">bar_chart</span>
                <p className="text-xs">No orders recorded in this date range.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. TOTAL PRODUCTS SOLD CHART OVER TIME */}
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-base text-on-surface font-bold">Total Products Sold Chart</h3>
              <p className="text-xs text-on-surface-variant">Daily units quantity sold for selected dates</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              {currentAnalytics.totalUnits} Units Sold
            </span>
          </div>

          <div className="pt-6 pb-2">
            {currentAnalytics.chartData && currentAnalytics.chartData.length > 0 ? (
              <>
                <div className="h-48 flex items-end justify-between gap-3 border-b border-outline-variant/30 px-2">
                  {currentAnalytics.chartData.map((d, i) => {
                    const pct = Math.round((d.units / maxUnitsInChart) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative">
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] font-bold py-1 px-2 rounded shadow whitespace-nowrap z-20 pointer-events-none">
                          {d.units} Items Sold ({d.day})
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-sm"
                          style={{ height: `${Math.max(pct, 15)}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between gap-3 px-2 mt-2 text-[10px] text-on-surface-variant font-bold">
                  {currentAnalytics.chartData.map((d, i) => (
                    <span key={i} className="flex-1 text-center truncate">{d.day}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-stone-400">
                <span className="material-symbols-outlined text-3xl mb-1">show_chart</span>
                <p className="text-xs">No product sales in this date range.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* REGIONAL & CATEGORY BREAKDOWN (100% REAL ORDERS DATA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Real Category Revenue Breakdown */}
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-base text-on-surface font-bold">Category Sales Breakdown</h3>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase bg-stone-100 px-2 py-0.5 rounded">
              Live Database
            </span>
          </div>
          
          <div className="space-y-3">
            {currentAnalytics.categoryBreakdown && currentAnalytics.categoryBreakdown.length > 0 ? (
              currentAnalytics.categoryBreakdown.map((cat, idx) => {
                const colors = ['bg-[#C27B7F]', 'bg-amber-600', 'bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600'];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface font-bold">{cat.name}</span>
                      <span className="text-black font-bold font-mono">₹{cat.rev.toLocaleString('en-IN')} ({cat.pct}%)</span>
                    </div>
                    <div className="w-full bg-[#F9F6F0] h-2.5 rounded-full overflow-hidden border border-outline-variant/30">
                      <div className={`${colorClass} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.max(cat.pct, 4)}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-stone-400">
                <span className="material-symbols-outlined text-3xl mb-1">category</span>
                <p className="text-xs">No category sales recorded yet for this period.</p>
              </div>
            )}
          </div>
        </div>

        {/* Real Sales by Region */}
        <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-base text-on-surface font-bold">Sales by Top Region</h3>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase bg-stone-100 px-2 py-0.5 rounded">
              Order Locations
            </span>
          </div>
          
          <div className="space-y-3">
            {currentAnalytics.regionBreakdown && currentAnalytics.regionBreakdown.length > 0 ? (
              currentAnalytics.regionBreakdown.map((reg, idx) => {
                const colors = ['bg-black', 'bg-[#C27B7F]', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600'];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface font-bold">{reg.name}</span>
                      <span className="text-black font-bold font-mono">{reg.pct}% ({reg.count} {reg.count === 1 ? 'order' : 'orders'})</span>
                    </div>
                    <div className="w-full bg-[#F9F6F0] h-2.5 rounded-full overflow-hidden border border-outline-variant/30">
                      <div className={`${colorClass} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.max(reg.pct, 4)}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-stone-400">
                <span className="material-symbols-outlined text-3xl mb-1">location_on</span>
                <p className="text-xs">No regional sales data available for this period.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
