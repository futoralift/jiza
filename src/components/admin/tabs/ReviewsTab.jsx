import React from 'react';

export default function ReviewsTab({
  adminReviews = [],
  reviewStatusFilter,
  setReviewStatusFilter,
  fetchAdminReviews,
  handleUpdateReviewStatus,
  handleDeleteReview
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Total Reviews</span>
          <p className="text-xl font-bold text-on-surface">{adminReviews.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-700">Pending Approval</span>
          <p className="text-xl font-bold text-amber-700">{adminReviews.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Approved Reviews</span>
          <p className="text-xl font-bold text-emerald-700">{adminReviews.filter(r => r.status === 'Approved').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-heritage-gold/30 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-heritage-gold">Average Rating</span>
          <p className="text-xl font-bold text-primary flex items-center gap-1">
            <span>
              {adminReviews.length > 0 
                ? (adminReviews.reduce((sum, r) => sum + Number(r.rating), 0) / adminReviews.length).toFixed(1) 
                : '5.0'}
            </span>
            <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-outline-variant/30">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-on-surface">Filter Status:</span>
          {['all', 'Pending', 'Approved', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setReviewStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                reviewStatusFilter === st
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-[#FCDAD7]/40'
              }`}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAdminReviews}
          className="px-3 py-1.5 bg-[#FCDAD7]/60 hover:bg-[#FCDAD7] text-black font-bold text-xs rounded-lg border border-black/15 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh List
        </button>
      </div>

      {/* Reviews List / Table */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-[#FCDAD7]/60 text-black font-label-sm uppercase text-[10px] border-b border-[#F7C5C0]">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Customer &amp; Order</th>
                <th className="p-3">Star Rating</th>
                <th className="p-3">Written Review</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {adminReviews
                .filter(r => reviewStatusFilter === 'all' || r.status === reviewStatusFilter)
                .length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-on-surface-variant">
                    No product reviews found for the selected filter.
                  </td>
                </tr>
              ) : (
                adminReviews
                  .filter(r => reviewStatusFilter === 'all' || r.status === reviewStatusFilter)
                  .map(rev => (
                    <tr key={rev.id} className="hover:bg-[#FFF0F2] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant shrink-0 bg-white flex items-center justify-center">
                            {rev.product_image ? (
                              <img src={rev.product_image} alt={rev.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-gray-400">diamond</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface line-clamp-1">{rev.product_name}</p>
                            <span className="text-[10px] text-outline font-mono">ID: {rev.product_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-on-surface">{rev.customer_name}</p>
                        <p className="text-[10px] text-on-surface-variant">{rev.customer_email}</p>
                        <span className="text-[10px] font-mono text-black font-bold">Order: #{rev.order_id}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center text-heritage-gold">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: `'FILL' ${s <= rev.rating ? 1 : 0}` }}>star</span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <p className="text-on-surface line-clamp-2">{rev.review_text || <span className="italic text-gray-400">No written text</span>}</p>
                      </td>
                      <td className="p-3 text-on-surface-variant font-mono text-[10px]">{rev.created_at}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          rev.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          rev.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {rev.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {rev.status !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateReviewStatus(rev.id, 'Approved')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                              title="Approve Review"
                            >
                              Approve
                            </button>
                          )}
                          {rev.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateReviewStatus(rev.id, 'Rejected')}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                              title="Reject Review"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded"
                            title="Delete Review"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
