import React from 'react';

export default function PremiumFeaturesTab({
  selectedPremiumFeature,
  setSelectedPremiumFeature,
  PREMIUM_FEATURES = [],
  activeDemoCall,
  setActiveDemoCall,
  arOverlay,
  setArOverlay,
  demoBookings = [],
  setDemoBookings,
  approvingId,
  setApprovingId,
  meetingInput,
  setMeetingInput,
  chatbotMessages = [],
  handleChatbotSend,
  chatbotInput,
  setChatbotInput,
  knowledgeBase = [],
  setKnowledgeBase,
  newKbQ,
  setNewKbQ,
  newKbA,
  setNewKbA,
  showAdminToast,
  setContactDevTargetFeature,
  setIsContactDevModalOpen
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {!selectedPremiumFeature ? (
        /* SECTION 1: ALL LOCKED PREMIUM FEATURES LIST (3-COLUMN GRID) */
        <div className="space-y-6">
          
          {/* Top Executive Pink/Gold Banner with PRO badge */}
          <div className="bg-[#FCDAD7] border border-black/15 rounded-3xl py-6 px-7 text-black shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="flex items-center space-x-3.5 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-black/10 border border-black/20 flex items-center justify-center text-black shadow-md shrink-0">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <h3 className="font-headline-md text-lg md:text-xl font-bold tracking-tight text-black flex items-center gap-2.5">
                  <span>Premium Features</span>
                  <span className="bg-gradient-to-r from-amber-500 to-heritage-gold text-black font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-md tracking-wider border border-amber-300">
                    PRO
                  </span>
                </h3>
                <p className="text-xs text-stone-800 font-medium mt-0.5">
                  Unlock individual production modules for Jiza Jewellery Studio.
                </p>
              </div>
            </div>

            <div className="bg-black text-[#FCDAD7] border border-black/20 rounded-2xl px-4 py-2 text-xs font-bold flex items-center gap-2 shrink-0 relative z-10">
              <span className="material-symbols-outlined text-sm">workspace_premium</span>
              <span>Enterprise Modules</span>
            </div>

            {/* Subtle Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-black/5 rounded-full blur-2xl pointer-events-none"></div>
          </div>

          {/* 3-Column Grid of Premium Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREMIUM_FEATURES.map((feature) => (
              <div
                key={feature.id}
                onClick={() => setSelectedPremiumFeature(feature)}
                className="bg-white border border-[#F7C5C0] hover:border-black rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* Card Top Row: Icon + Locked Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-black text-[#FCDAD7] border border-black/20 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                    </div>

                    <span className="bg-amber-500/15 text-amber-800 border border-amber-400/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[12px]">lock</span>
                      <span>🔒 Locked</span>
                    </span>
                  </div>

                  {/* Category Tag & Feature Name */}
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-[#FCDAD7]/60 px-2 py-0.5 rounded-md border border-black/10">
                      {feature.tag}
                    </span>
                    <h3 className="font-bold text-base text-on-surface mt-2 group-hover:text-black transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-medium line-clamp-2 mt-1">
                      {feature.subtitle}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Pricing & Contact Developer Button */}
                <div className="pt-4 border-t border-outline-variant/20 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Pricing</span>
                    <span className="font-bold text-xs text-black">{feature.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPremiumFeature(feature);
                    }}
                    className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-[11px] px-3.5 py-2 rounded-xl shadow border border-black/20 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>View Details</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        /* SECTION 2: DEDICATED HIGH-CONVERTING FEATURE UPGRADE PAGE */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Navigation Back Button */}
          <button
            onClick={() => setSelectedPremiumFeature(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-black bg-white border border-outline-variant/40 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>← Back to ⭐ Premium Features</span>
          </button>

          {/* Feature Upgrade Card */}
          <div className="bg-white border border-[#F7C5C0] rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-black text-[#FCDAD7] border border-black/20 flex items-center justify-center shadow-lg shrink-0">
                  <span className="material-symbols-outlined text-3xl">{selectedPremiumFeature.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/20 text-amber-800 border border-amber-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">lock</span>
                      <span>🔒 Locked Feature</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black bg-[#FCDAD7]/60 px-2 py-0.5 rounded-md border border-black/10">
                      {selectedPremiumFeature.tag}
                    </span>
                  </div>
                  <h2 className="font-headline-md text-2xl text-black font-bold mt-1">
                    {selectedPremiumFeature.title}
                  </h2>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                    {selectedPremiumFeature.subtitle}
                  </p>
                </div>
              </div>

              {/* Upgrade Price Box */}
              <div className="bg-black text-[#FCDAD7] border border-black/20 rounded-2xl p-4 text-center shrink-0 w-full md:w-auto shadow-md">
                <span className="text-[10px] uppercase tracking-wider block text-[#FCDAD7]/80 font-bold">
                  Pricing
                </span>
                <span className="font-headline-md text-2xl font-bold text-white block">
                  {selectedPremiumFeature.price}
                </span>
              </div>
            </div>

            {/* Locked Status Statement Box */}
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-5 flex items-start gap-3 text-amber-900 shadow-sm">
              <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0 mt-0.5">lock_clock</span>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-sm text-amber-950">This is a Premium Feature.</h4>
                <p className="font-medium text-amber-900">
                  To unlock <strong className="text-amber-950 font-bold">{selectedPremiumFeature.title}</strong> ({selectedPremiumFeature.price}), please contact the developer to activate full functionality and live database integration.
                </p>
              </div>
            </div>

            {/* Detailed Business Benefits Breakdown */}
            <div className="space-y-4">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-black">workspace_premium</span>
                <span>Key Benefits &amp; Capabilities:</span>
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                {selectedPremiumFeature.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {selectedPremiumFeature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 bg-[#FFF0F2]/40 border border-[#F7C5C0] p-3 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 font-bold">check_circle</span>
                    <span className="text-xs font-semibold text-on-surface">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sandbox Demo Example Window */}
            {selectedPremiumFeature.id === 'virtual-try-on' && (
              <div className="mt-8 border-t border-[#F7C5C0] pt-6 space-y-4">
                <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF6EE] border border-[#F7C5C0] rounded-2xl p-5 md:p-6 shadow-md relative overflow-hidden">
                  {/* Top Tag */}
                  <div className="absolute top-0 right-0 bg-black text-[#FCDAD7] text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-xl shadow">
                    Interactive Demo Sandbox
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-black text-2xl">science</span>
                    <div>
                      <h4 className="font-headline-sm text-sm font-bold text-black">Interactive Example: Virtual Try-On Console</h4>
                      <p className="text-[10px] text-gray-500 font-medium">Experience the booking and AR consultation workflow from the administrator panel.</p>
                    </div>
                  </div>

                  {/* Try-On Call Viewport Overlay (renders if call is active) */}
                  {activeDemoCall ? (
                    <div className="bg-[#1A1A1A] border-2 border-black rounded-2xl overflow-hidden shadow-xl animate-scaleUp">
                      {/* Call Header */}
                      <div className="bg-black px-4 py-2 border-b border-white/20 flex items-center justify-between text-white text-[11px] font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block"></span>
                          <span>Live AR Consultation: {activeDemoCall.name}</span>
                        </div>
                        <span className="bg-[#FCDAD7] text-black px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">Slot: {activeDemoCall.timeSlot}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12">
                        {/* Left Side: Camera feed mockup */}
                        <div className="md:col-span-7 bg-[#111] relative aspect-square flex items-center justify-center overflow-hidden h-[320px] md:h-[380px]">
                          {/* Subject Portrait */}
                          <img 
                            src="/demo_call.webp" 
                            alt="Mock Client Portrait" 
                            className="w-full h-full object-cover opacity-85 absolute inset-0"
                            loading="lazy"
                          />

                          {/* AR Jewellery Overlays */}
                          {arOverlay === 'choker' && (
                            <div className="absolute inset-x-0 bottom-[18%] flex justify-center z-20 pointer-events-none animate-fadeIn">
                              <svg width="220" height="90" viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_8px_rgba(212,175,55,0.7)]">
                                <path d="M10 10C60 60 160 60 210 10" stroke="#D4AF37" strokeWidth="8" strokeLinecap="round"/>
                                <path d="M25 22C65 65 155 65 195 22" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round"/>
                                <circle cx="110" cy="56" r="8" fill="#990000" stroke="#fff" strokeWidth="2"/>
                                <circle cx="80" cy="50" r="6" fill="#046307" stroke="#fff" strokeWidth="1.5"/>
                                <circle cx="140" cy="50" r="6" fill="#046307" stroke="#fff" strokeWidth="1.5"/>
                                <circle cx="50" cy="38" r="5" fill="#990000" stroke="#fff" strokeWidth="1.5"/>
                                <circle cx="170" cy="38" r="5" fill="#990000" stroke="#fff" strokeWidth="1.5"/>
                              </svg>
                            </div>
                          )}

                          {arOverlay === 'ruby' && (
                            <div className="absolute inset-x-0 bottom-[15%] flex justify-center z-20 pointer-events-none animate-fadeIn">
                              <svg width="240" height="110" viewBox="0 0 240 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_10px_rgba(153,0,0,0.8)]">
                                <path d="M15 15C70 85 170 85 225 15" stroke="#990000" strokeWidth="8" strokeLinecap="round"/>
                                <path d="M30 30C75 95 165 95 210 30" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round"/>
                                <path d="M120 70 L115 88 A5 5 0 0 0 125 88 Z" fill="#990000" stroke="#fff" strokeWidth="1.5"/>
                                <path d="M90 62 L86 78 A4 4 0 0 0 94 78 Z" fill="#990000" stroke="#fff" strokeWidth="1"/>
                                <path d="M150 62 L146 78 A4 4 0 0 0 154 78 Z" fill="#990000" stroke="#fff" strokeWidth="1"/>
                              </svg>
                            </div>
                          )}

                          {arOverlay === 'tiara' && (
                            <div className="absolute inset-x-0 top-[20%] flex justify-center z-20 pointer-events-none animate-fadeIn">
                              <svg width="180" height="70" viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_2px_12px_rgba(255,255,255,0.8)]">
                                <path d="M20 60 C50 30 130 30 160 60" stroke="#C0C0C0" strokeWidth="6" strokeLinecap="round"/>
                                <polygon points="90,10 82,45 98,45" fill="#C0C0C0"/>
                                <polygon points="60,25 54,50 66,50" fill="#C0C0C0"/>
                                <polygon points="120,25 114,50 126,50" fill="#C0C0C0"/>
                                <circle cx="90" cy="10" r="3" fill="#fff"/>
                                <circle cx="60" cy="25" r="2.5" fill="#fff"/>
                                <circle cx="120" cy="25" r="2.5" fill="#fff"/>
                              </svg>
                            </div>
                          )}

                          {/* AR overlay text indicator */}
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                            AR Lens: {arOverlay.toUpperCase()}
                          </div>
                        </div>

                        {/* Right Side: Controls and tools */}
                        <div className="md:col-span-5 bg-[#252525] p-5 flex flex-col justify-between text-white border-l border-white/10">
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-bold text-xs uppercase text-[#FCDAD7] tracking-wider font-headline-sm">AR Filters Control Panel</h5>
                              <p className="text-[10px] text-gray-400 mt-1">Tap a filter to instantly project the high-end jewellery model onto the customer in real-time:</p>
                            </div>

                            {/* Filters List */}
                            <div className="space-y-2">
                              <button 
                                onClick={() => setArOverlay('none')}
                                className={`w-full py-2 px-3 text-left rounded-xl text-xs font-bold transition-all border ${
                                  arOverlay === 'none' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5'
                                }`}
                              >
                                No Jewelry Overlay
                              </button>
                              <button 
                                onClick={() => setArOverlay('choker')}
                                className={`w-full py-2 px-3 text-left rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                                  arOverlay === 'choker' ? 'bg-[#FCDAD7] text-black border-black/20 font-bold' : 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5'
                                }`}
                              >
                                <span>👑 Kundan Gold Choker</span>
                                <span className="text-[8px] bg-black/20 px-1 py-0.2 rounded font-mono">AR Lens 1</span>
                              </button>
                              <button 
                                onClick={() => setArOverlay('ruby')}
                                className={`w-full py-2 px-3 text-left rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                                  arOverlay === 'ruby' ? 'bg-red-700 text-white border-red-600' : 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5'
                                }`}
                              >
                                <span>💎 Imperial Ruby Set</span>
                                <span className="text-[8px] bg-black/20 px-1 py-0.2 rounded font-mono">AR Lens 2</span>
                              </button>
                              <button 
                                onClick={() => setArOverlay('tiara')}
                                className={`w-full py-2 px-3 text-left rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                                  arOverlay === 'tiara' ? 'bg-blue-900 text-white border-blue-800' : 'bg-transparent text-gray-300 border-white/10 hover:bg-white/5'
                                }`}
                              >
                                <span>✨ Diamond Queen Tiara</span>
                                <span className="text-[8px] bg-black/20 px-1 py-0.2 rounded font-mono">AR Lens 3</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2.5 pt-4 border-t border-white/10 mt-4">
                            <button 
                              onClick={() => alert(`📸 Snapshot captured! Detailed lookbook file sent to ${activeDemoCall.name} via WhatsApp/Email.`)}
                              className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">photo_camera</span>
                              Capture &amp; Email Lookbook
                            </button>
                            <button 
                              onClick={() => { setActiveDemoCall(null); setArOverlay('none'); }}
                              className="w-full py-2 bg-red-950/60 hover:bg-red-900 text-red-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-red-500/20 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">call_end</span>
                              End Call Consultation
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Bookings Table view */
                    <div className="space-y-4 animate-fadeIn">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-black mb-1">Incoming Video Call Consultation Requests</h5>
                      <div className="overflow-x-auto border border-[#F7C5C0] rounded-xl bg-white">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#FCDAD7]/60 border-b border-[#F7C5C0] text-black font-bold">
                              <th className="p-3">Customer</th>
                              <th className="p-3">Category Interest</th>
                              <th className="p-3">Preferred Slot</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {demoBookings.map((b) => (
                              <tr key={b.id} className="border-b border-[#F7C5C0]/50 hover:bg-[#FFF0F2]/50 transition-colors">
                                <td className="p-3">
                                  <p className="font-bold text-on-surface">{b.name}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">{b.phone}</p>
                                </td>
                                <td className="p-3 text-on-surface-variant font-medium">{b.interest}</td>
                                <td className="p-3">
                                  <p className="font-bold text-on-surface">{b.date}</p>
                                  <p className="text-[10px] text-gray-500 font-medium">{b.timeSlot}</p>
                                </td>
                                <td className="p-3">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                    b.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                    b.status === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                                    'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right space-y-1">
                                  {b.status === 'Pending' && (
                                    <div className="flex gap-1 justify-end">
                                      {approvingId === b.id ? (
                                        <div className="flex gap-1 items-center bg-[#FFF0F2] border border-[#F7C5C0] p-1.5 rounded-xl absolute z-10 right-4 animate-scaleUp shadow-lg">
                                          <input 
                                            type="text" 
                                            placeholder="Google Meet Link"
                                            value={meetingInput}
                                            onChange={(e) => setMeetingInput(e.target.value)}
                                            className="bg-white border border-[#F7C5C0] px-2 py-1 rounded text-[10px] w-40 focus:outline-none"
                                          />
                                          <button 
                                            onClick={() => {
                                              const linkVal = meetingInput.trim() || 'https://meet.google.com/xyz-abc-123';
                                              setDemoBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'Approved', link: linkVal } : item));
                                              setMeetingInput('');
                                              setApprovingId(null);
                                            }}
                                            className="bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                          >
                                            Save
                                          </button>
                                          <button 
                                            onClick={() => setApprovingId(null)}
                                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => {
                                              setApprovingId(b.id);
                                              setMeetingInput('https://meet.google.com/xyz-abc-123');
                                            }}
                                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                                          >
                                            Approve
                                          </button>
                                          <button 
                                            onClick={() => setDemoBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'Cancelled' } : item))}
                                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  {b.status === 'Approved' && (
                                    <button 
                                      onClick={() => setActiveDemoCall(b)}
                                      className="bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black border border-black/20 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 ml-auto shadow-sm cursor-pointer"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">videocam</span>
                                      Join Try-On Call
                                    </button>
                                  )}

                                  {b.status === 'Cancelled' && (
                                    <span className="text-[10px] text-gray-400 italic">Cancelled</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Sandbox Demo Example Window for AI Chatbot */}
            {selectedPremiumFeature.id === 'ai-chatbot' && (
              <div className="mt-8 border-t border-[#F7C5C0] pt-6 space-y-4">
                <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FAF6EE] border border-[#F7C5C0] rounded-2xl p-5 md:p-6 shadow-md relative overflow-hidden">
                  {/* Top Tag */}
                  <div className="absolute top-0 right-0 bg-black text-[#FCDAD7] text-[9px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-xl shadow">
                    Interactive Demo Sandbox
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-black text-2xl">smart_toy</span>
                    <div>
                      <h4 className="font-headline-sm text-sm font-bold text-black">Interactive Example: AI Chatbot Assistant</h4>
                      <p className="text-[10px] text-gray-500 font-medium">Test customer interaction queries and train the chatbot's custom knowledge base.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Side: Live Chat Simulator (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col bg-white border border-[#F7C5C0] rounded-2xl overflow-hidden shadow-sm h-[380px]">
                      {/* Simulator Header */}
                      <div className="bg-black text-[#FCDAD7] px-4 py-3 flex items-center justify-between border-b border-white/20">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          <span className="text-xs font-bold font-headline-sm">Jiza AI Stylist Chatbot</span>
                        </div>
                        <span className="text-[9px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-semibold border border-amber-500/25">Live Sandbox</span>
                      </div>

                      {/* Message History */}
                      <div className="flex-grow p-4 overflow-y-auto space-y-3 scrollbar-thin text-xs">
                        {chatbotMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed shadow-xs ${
                              msg.sender === 'user'
                                ? 'bg-black text-[#FCDAD7] rounded-tr-none font-semibold'
                                : 'bg-[#FFF0F2] text-black border border-[#F7C5C0] rounded-tl-none font-medium whitespace-pre-line'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Preset Quick Replies */}
                      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5 shrink-0">
                        <button
                          onClick={() => handleChatbotSend('Suggest Bridal Sets')}
                          className="text-[10px] bg-white border border-gray-200 hover:border-black hover:bg-[#FFF0F2] px-2.5 py-1 rounded-full text-gray-700 font-bold transition-all cursor-pointer"
                        >
                          ✨ Recommend Sets
                        </button>
                        <button
                          onClick={() => handleChatbotSend('Track Order JIZA-773516')}
                          className="text-[10px] bg-white border border-gray-200 hover:border-black hover:bg-[#FFF0F2] px-2.5 py-1 rounded-full text-gray-700 font-bold transition-all cursor-pointer"
                        >
                          📦 Track JIZA-773516
                        </button>
                        <button
                          onClick={() => handleChatbotSend('Is delivery insured?')}
                          className="text-[10px] bg-white border border-gray-200 hover:border-black hover:bg-[#FFF0F2] px-2.5 py-1 rounded-full text-gray-700 font-bold transition-all cursor-pointer"
                        >
                          🛡️ Insured Delivery?
                        </button>
                      </div>

                      {/* Simulator Input Area */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleChatbotSend(chatbotInput);
                        }}
                        className="p-3 border-t border-[#F7C5C0] bg-white flex gap-2 shrink-0"
                      >
                        <input
                          type="text"
                          placeholder="Type customer query..."
                          value={chatbotInput}
                          onChange={(e) => setChatbotInput(e.target.value)}
                          className="flex-grow px-3 py-2 bg-[#FFF0F2]/40 border border-[#F7C5C0] focus:outline-none focus:border-black text-xs rounded-xl"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Send
                        </button>
                      </form>
                    </div>

                    {/* Right Side: KB Training & Active FAQ Console (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      
                      {/* AI Analytics Card */}
                      <div className="bg-white border border-[#F7C5C0] rounded-2xl p-4 shadow-xs space-y-2">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">AI Live Analytics</span>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-[#FFF0F2]/50 border border-[#F7C5C0] p-2.5 rounded-xl">
                            <span className="block text-lg font-bold text-black">94.2%</span>
                            <span className="text-[9px] text-gray-500 font-bold">Auto-Resolved</span>
                          </div>
                          <div className="bg-[#FFF0F2]/50 border border-[#F7C5C0] p-2.5 rounded-xl">
                            <span className="block text-lg font-bold text-black">12</span>
                            <span className="text-[9px] text-gray-500 font-bold">Active Chats</span>
                          </div>
                        </div>
                      </div>

                      {/* KB Training Console */}
                      <div className="bg-white border border-[#F7C5C0] rounded-2xl p-4 shadow-xs space-y-3">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Train FAQ Knowledge Base</span>
                        
                        <div className="space-y-2 text-xs">
                          <input
                            type="text"
                            placeholder="Question keyword (e.g. refund)"
                            value={newKbQ}
                            onChange={(e) => setNewKbQ(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#FFF0F2]/40 border border-[#F7C5C0] rounded-lg text-xs"
                          />
                          <textarea
                            placeholder="AI Bot response text..."
                            rows="2"
                            value={newKbA}
                            onChange={(e) => setNewKbA(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#FFF0F2]/40 border border-[#F7C5C0] rounded-lg text-xs resize-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newKbQ.trim() || !newKbA.trim()) return;
                              setKnowledgeBase(prev => [...prev, { q: newKbQ.trim(), a: newKbA.trim() }]);
                              if (typeof showAdminToast === 'function') showAdminToast('🧠 AI Knowledge Base trained successfully!');
                              setNewKbQ('');
                              setNewKbA('');
                            }}
                            className="w-full py-2 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                          >
                            Train AI Bot
                          </button>
                        </div>
                      </div>

                      {/* Configured FAQs */}
                      <div className="max-h-[110px] overflow-y-auto space-y-1.5 scrollbar-thin">
                        {knowledgeBase.map((item, idx) => (
                          <div key={idx} className="bg-white/80 border border-gray-150 p-2.5 rounded-xl text-[10px]">
                            <strong className="text-black block">Q: {item.q}</strong>
                            <span className="text-gray-500 block line-clamp-1">A: {item.a}</span>
                          </div>
                        ))}
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* High-Converting Action Buttons (ONLY CONTACT DEVELOPER) */}
            <div className="pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-on-surface-variant">
                <span className="font-bold text-on-surface">Ready to activate this feature?</span>
                <p className="text-[11px] text-gray-500">Contact Jiza Studio Developer via WhatsApp or direct call.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (typeof setContactDevTargetFeature === 'function') setContactDevTargetFeature(selectedPremiumFeature);
                  if (typeof setIsContactDevModalOpen === 'function') setIsContactDevModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-bold text-xs rounded-xl shadow-lg border border-black/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Contact Developer</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
