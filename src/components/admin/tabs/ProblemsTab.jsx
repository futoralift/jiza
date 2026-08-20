import React from 'react';

export default function ProblemsTab({
  adminProblems = [],
  problemStatusFilter,
  setProblemStatusFilter,
  fetchAdminProblems,
  setSelectedProblemScreenshotModal,
  setSelectedProblemModal,
  setProblemModalStatus,
  setProblemModalNotes
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant">Total Complaints</span>
          <p className="text-xl font-bold text-on-surface">{adminProblems.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-blue-700">New Tickets</span>
          <p className="text-xl font-bold text-blue-700">{adminProblems.filter(p => p.status === 'New').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-700">In Progress</span>
          <p className="text-xl font-bold text-amber-700">{adminProblems.filter(p => p.status === 'In Progress').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Resolved</span>
          <p className="text-xl font-bold text-emerald-700">{adminProblems.filter(p => p.status === 'Resolved').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-700">Closed</span>
          <p className="text-xl font-bold text-gray-700">{adminProblems.filter(p => p.status === 'Closed').length}</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-outline-variant/30">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-on-surface shrink-0">Filter Status:</span>
          {['all', 'New', 'In Progress', 'Resolved', 'Closed'].map(st => (
            <button
              key={st}
              onClick={() => setProblemStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                problemStatusFilter === st
                  ? 'bg-[#FCDAD7] text-black border border-black/20 shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-[#FCDAD7]/40'
              }`}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAdminProblems}
          className="px-3 py-1.5 bg-[#FCDAD7]/60 hover:bg-[#FCDAD7] text-black font-bold text-xs rounded-lg border border-black/15 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh Tickets
        </button>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-[#FCDAD7]/60 text-black font-label-sm uppercase text-[10px] border-b border-[#F7C5C0]">
              <tr>
                <th className="p-3">Complaint ID</th>
                <th className="p-3">Customer Details</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Description</th>
                <th className="p-3">Screenshot</th>
                <th className="p-3">Date &amp; Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {adminProblems
                .filter(p => problemStatusFilter === 'all' || p.status === problemStatusFilter)
                .length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-on-surface-variant">
                    No problem reports found for the selected filter.
                  </td>
                </tr>
              ) : (
                adminProblems
                  .filter(p => problemStatusFilter === 'all' || p.status === problemStatusFilter)
                  .map(prob => (
                    <tr key={prob.id} className="hover:bg-[#FFF0F2] transition-colors">
                      <td className="p-3 font-mono font-bold text-black">{prob.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-on-surface">{prob.customer_name}</p>
                        <p className="text-[10px] text-on-surface-variant">{prob.customer_email}</p>
                        {prob.customer_phone && <p className="text-[10px] text-outline">{prob.customer_phone}</p>}
                      </td>
                      <td className="p-3 font-bold text-on-surface max-w-[150px] truncate">{prob.subject}</td>
                      <td className="p-3 max-w-[220px]">
                        <p className="line-clamp-2 text-on-surface-variant">{prob.description}</p>
                      </td>
                      <td className="p-3">
                        {prob.screenshot ? (
                          <button
                            onClick={() => setSelectedProblemScreenshotModal(prob.screenshot)}
                            className="w-10 h-10 rounded border border-outline-variant overflow-hidden hover:opacity-80 transition-opacity"
                            title="Click to view full screenshot"
                          >
                            <img src={prob.screenshot} alt="Thumbnail" className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-on-surface-variant">{prob.created_at}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          prob.status === 'New' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          prob.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          prob.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {prob.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProblemModal(prob);
                            setProblemModalStatus(prob.status || 'New');
                            setProblemModalNotes(prob.admin_notes || '');
                          }}
                          className="px-3 py-1 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-[10px] rounded-lg shadow-xs border border-black/20 cursor-pointer"
                        >
                          Inspect Ticket
                        </button>
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
