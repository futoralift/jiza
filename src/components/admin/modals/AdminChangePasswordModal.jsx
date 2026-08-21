import React, { useState } from 'react';
import { API_BASE, getAdminEmail } from '../../../config';

export default function AdminChangePasswordModal({ isOpen, onClose }) {
  const adminEmail = getAdminEmail();
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and Confirm Password do not match. Please re-enter both carefully.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMsg('New password cannot be identical to your old password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail,
          phone: phone.trim(),
          oldPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update password. Please verify current credentials.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || '✅ Password changed successfully! Old password is now permanently deactivated.');
      setPhone('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2000);

    } catch (err) {
      console.error('Error changing admin password:', err);
      setErrorMsg('Network error updating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FFF9F9] border border-[#F7B6B0] rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-black p-2 rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-[#FCDAD7] border border-black/20 rounded-2xl flex items-center justify-center text-black mx-auto shadow-xs">
            <span className="material-symbols-outlined text-2xl">lock_reset</span>
          </div>
          <h2 className="font-headline-sm text-lg font-bold text-on-surface">
            Change Admin Password
          </h2>
          <p className="font-body-md text-xs text-on-surface-variant">
            Account: <span className="font-mono font-bold text-black">{adminEmail}</span>
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Registered Admin Phone (10 Digits) *
            </label>
            <div className="flex rounded-xl overflow-hidden border border-outline-variant focus-within:border-black bg-[#F9F6F0] focus-within:bg-white shadow-xs">
              <span className="bg-[#FCDAD7] text-black font-bold text-xs px-3 py-2 flex items-center border-r border-black/15 select-none font-mono">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                placeholder="10-digit Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-transparent px-3.5 py-2 text-xs text-on-surface focus:outline-none font-semibold font-mono tracking-wider"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Current / Old Password *
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl pl-3.5 pr-10 py-2 text-xs text-on-surface focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {showOldPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              New Password (Type 1st Time) *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl pl-3.5 pr-10 py-2 text-xs text-on-surface focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {showNewPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Confirm New Password (Type 2nd Time - Exact Match) *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl pl-3.5 pr-10 py-2 text-xs text-on-surface focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-black/25 disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Updating Password in Database...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">lock_reset</span>
                <span>Update Password &amp; Invalidate Old</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
