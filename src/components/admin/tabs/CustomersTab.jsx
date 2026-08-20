import React, { useState, useEffect, useRef } from 'react';
import { adminFetch } from '../../../config';

export default function CustomersTab({
  handleExportCustomers,
  setSelectedCustomerDetails,
  adminToken
}) {
  const [customersList, setCustomersList] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 50;
  const searchDebounceRef = useRef(null);

  const fetchCustomers = async (searchVal = '', pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ paged: 'true', page: pageNum, limit: LIMIT });
      if (searchVal.trim()) params.set('search', searchVal.trim());
      const res = await adminFetch(`/api/admin/customers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const list = Array.isArray(data) ? data : (data.customers || []);
        setCustomersList(list);
        setTotal(data.total ?? list.length);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers(search, page);
  }, [page]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      fetchCustomers(val, 1);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col gap-3 mb-4 pb-2 border-b border-outline-variant/20">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-base text-on-surface font-bold">
              Registered Customer Accounts {total > 0 ? `(${total})` : ''}
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleExportCustomers('csv')}
                className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold px-3 py-1.5 rounded-xl border border-black/20 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="Export full customer database to Microsoft Excel / CSV"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Customers (.CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportCustomers('xlsx')}
                className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black text-xs font-bold px-2.5 py-1.5 rounded-xl border border-black/20 shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Export full customer database to Excel (.xlsx)"
              >
                <span className="text-[10px] font-mono">.XLSX</span>
              </button>
            </div>
          </div>

          {/* Server-side Search — searches ALL customers in the database */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name, email, phone, city or customer ID..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-outline-variant/40 rounded-xl bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-on-surface-variant text-xs">Loading customers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface">
              <thead className="bg-[#FCDAD7]/60 text-black font-label-sm uppercase text-[10px] border-b border-[#F7C5C0]">
                <tr>
                  <th className="p-3 font-semibold">Customer ID</th>
                  <th className="p-3 font-semibold">Full Name</th>
                  <th className="p-3 font-semibold">Contact Email</th>
                  <th className="p-3 font-semibold">Phone Number</th>
                  <th className="p-3 font-semibold">Joined Date</th>
                  <th className="p-3 text-right font-semibold">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {customersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                      {search ? `No customers found for "${search}"` : 'No customers yet.'}
                    </td>
                  </tr>
                ) : (
                  customersList.map(c => (
                    <tr key={c.id} className="hover:bg-[#FFF0F2] transition-colors">
                      <td className="p-3 font-bold text-black">{c.id}</td>
                      <td className="p-3 font-bold text-on-surface">{c.name}</td>
                      <td className="p-3 text-on-surface-variant">{c.email}</td>
                      <td className="p-3 text-on-surface-variant">{c.phone}</td>
                      <td className="p-3 text-on-surface-variant">{c.joinedDate || 'Recent'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedCustomerDetails(c)}
                          className="text-black hover:underline font-bold"
                        >
                          View Account
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20">
            <span className="text-xs text-on-surface-variant">
              Page {page} of {totalPages} — {total} total customers
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-black/20 bg-[#FCDAD7] text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F9C5C0] transition-all"
              >
                ← Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-black/20 bg-[#FCDAD7] text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F9C5C0] transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
