import React from 'react';

export default function ProblemDetailsModal({
  selectedProblemModal,
  setSelectedProblemModal,
  setSelectedProblemScreenshotModal,
  problemModalStatus,
  setProblemModalStatus,
  problemModalNotes,
  setProblemModalNotes,
  handleSaveProblemChanges,
  isReadOnly = false
}) {
  if (!selectedProblemModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-deep-onyx/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-surface border border-heritage-gold/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp relative">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-700">
              <span className="material-symbols-outlined text-lg">support_agent</span>
            </span>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">Inspect Ticket #{selectedProblemModal.id}</h3>
              <p className="text-[11px] text-on-surface-variant">Logged on {selectedProblemModal.created_at}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedProblemModal(null)}
            className="p-1.5 hover:bg-surface-container rounded-full text-on-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Customer Details Box */}
        <div className="p-3.5 bg-[#FFF0F2]/50 rounded-xl border border-[#F7C5C0] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-bold text-outline uppercase block">Customer Name</span>
            <span className="font-bold text-on-surface">{selectedProblemModal.customer_name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-outline uppercase block">Email Address</span>
            <span className="font-bold text-on-surface">{selectedProblemModal.customer_email}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-outline uppercase block">Phone Number</span>
            <span className="font-bold text-on-surface">{selectedProblemModal.customer_phone || 'N/A'}</span>
          </div>
        </div>

        {/* Subject & Description */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-on-surface">Subject: {selectedProblemModal.subject}</h4>
          <div className="p-3.5 bg-white border border-outline-variant/50 rounded-xl text-xs text-on-surface leading-relaxed max-h-40 overflow-y-auto">
            {selectedProblemModal.description}
          </div>
        </div>

        {/* Screenshot if available */}
        {selectedProblemModal.screenshot && (
          <div className="space-y-1">
            <span className="text-xs font-bold text-on-surface block">Attached Screenshot:</span>
            <button
              type="button"
              onClick={() => setSelectedProblemScreenshotModal(selectedProblemModal.screenshot)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFF0F2] hover:bg-[#FCDAD7] text-black font-bold text-xs rounded-lg border border-black/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">image</span> View Full High-Res Screenshot
            </button>
          </div>
        )}

        {/* Edit Status & Admin Response Form */}
        <form onSubmit={handleSaveProblemChanges} className="space-y-4 pt-2 border-t border-outline-variant/30">
          <div>
            <label className="font-label-sm text-xs text-on-surface-variant font-bold block mb-1">
              Ticket Status
            </label>
            {isReadOnly ? (
              <div className="p-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-on-surface">
                {problemModalStatus} (Read Only)
              </div>
            ) : (
              <select
                value={problemModalStatus}
                onChange={(e) => setProblemModalStatus(e.target.value)}
                className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold text-on-surface focus:outline-none focus:border-black"
              >
                <option value="New">🔵 New</option>
                <option value="In Progress">🟡 In Progress</option>
                <option value="Resolved">🟢 Resolved</option>
                <option value="Closed">⚪ Closed</option>
              </select>
            )}
          </div>

          <div>
            <label className="font-label-sm text-xs text-on-surface-variant font-bold block mb-1">
              Internal Notes &amp; Customer Response
            </label>
            <textarea
              rows={3}
              value={problemModalNotes}
              onChange={(e) => setProblemModalNotes(e.target.value)}
              disabled={isReadOnly}
              placeholder={isReadOnly ? "No notes recorded." : "Enter resolution details, tracking info, or notes for the customer..."}
              className={`w-full bg-white border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:outline-none font-medium ${
                isReadOnly ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'focus:border-black'
              }`}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedProblemModal(null)}
              className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-bold text-xs rounded-xl cursor-pointer"
            >
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="px-5 py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow border border-black/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Save Ticket Changes</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
