import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'change_password'
  const [step, setStep] = useState(1); // 1: Email + Phone + Password, 2: OTP Code
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 mins countdown

  useEffect(() => {
    let interval = null;
    if (mode === 'login' && step === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setErrorMsg('OTP has expired. Please restart authentication.');
    }
    return () => clearInterval(interval);
  }, [mode, step, otpTimer]);

  if (!isOpen) return null;

  // Step 1: Submit Credentials (Email + Phone + Password)
  const handleVerifyCredentials = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const cleanEndpoint = `${API_BASE}/api/admin/auth/verify-credentials`;
      const res = await fetch(cleanEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim(), password })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      setStep(2);
      setOtpTimer(300);
      setSuccessMsg(data.message || 'Step 1 verified. Enter OTP code 123456 to complete Admin login.');
    } catch (err) {
      console.error('Admin credential verification error:', err);
      setErrorMsg('Network error connecting to authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const cleanEndpoint = `${API_BASE}/api/admin/auth/verify-otp`;
      const res = await fetch(cleanEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        onLoginSuccess(data.token, data.role, data.email || email.trim());
        return;
      }

      setErrorMsg(data.error || 'Invalid OTP code. Please enter the correct 6-digit OTP.');
    } catch (err) {
      console.error('Admin OTP verification error:', err);
      setErrorMsg('Network error verifying OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change Admin Password Handler
  const handleChangePassword = async (e) => {
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
      const cleanEndpoint = `${API_BASE}/api/admin/auth/change-password`;
      const res = await fetch(cleanEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          oldPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update password. Please verify your current credentials.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || '✅ Password changed successfully! Old password is now deactivated. Please log in.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPassword('');
      
      // Auto-switch to login view after short delay
      setTimeout(() => {
        setMode('login');
        setStep(1);
      }, 1800);

    } catch (err) {
      console.error('Change password error:', err);
      setErrorMsg('Network error updating password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#FFF9F9] border border-[#F7B6B0] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-heritage-gold p-2 rounded-full transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#FCDAD7] border border-black/20 rounded-2xl flex items-center justify-center text-black mx-auto shadow-sm">
            <span className="material-symbols-outlined text-2xl">
              {mode === 'change_password' ? 'lock_reset' : 'admin_panel_settings'}
            </span>
          </div>
          <h2 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface">
            {mode === 'change_password' ? 'Change Admin Password' : 'Enterprise Admin Authentication'}
          </h2>
          <p className="font-body-md text-xs text-on-surface-variant">
            {mode === 'change_password'
              ? 'Enter current credentials & type new password 2 times'
              : step === 1 
                ? 'Step 1 of 2: Multi-Factor Credential Verification' 
                : 'Step 2 of 2: 6-Digit Email OTP Verification'}
          </p>
        </div>

        {/* Stepper Indicator (Login Mode Only) */}
        {mode === 'login' && (
          <div className="flex items-center justify-center gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-12 bg-black' : 'w-4 bg-gray-300'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-12 bg-black' : 'w-4 bg-gray-300'}`}></div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Message */}
        {successMsg && !errorMsg && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: Step 1 Login (Email + Phone + Password) */}
        {mode === 'login' && step === 1 && (
          <form onSubmit={handleVerifyCredentials} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Registered Admin Email *
              </label>
              <input
                type="email"
                required
                placeholder="admin@jizajewellery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Registered Admin Phone (10 Digits) *
              </label>
              <div className="flex rounded-xl overflow-hidden border border-outline-variant focus-within:border-black bg-[#F9F6F0] focus-within:bg-white shadow-xs">
                <span className="bg-[#FCDAD7] text-black font-bold text-xs px-3 py-2.5 flex items-center border-r border-black/15 select-none font-mono">
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
                  className="w-full bg-transparent px-3.5 py-2.5 text-xs text-on-surface focus:outline-none font-semibold font-mono tracking-wider"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-on-surface">
                  Password *
                </label>
                {/* CHANGE PASSWORD BUTTON RIGHT ABOVE PASSWORD INPUT */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('change_password');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] font-bold text-black hover:text-amber-800 underline underline-offset-2 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Click to reset or change your admin password"
                >
                  <span className="material-symbols-outlined text-[13px]">key</span>
                  <span>Change Password?</span>
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-on-surface focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-black/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Verify Factors &amp; Send OTP</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* VIEW 2: Step 2 Login (6-Digit OTP Verification) */}
        {mode === 'login' && step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-on-surface">
                  Enter 6-Digit Email OTP *
                </label>
                <span className="text-[11px] font-bold text-black">
                  ⏱️ Expires in {formatTimer(otpTimer)}
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-3 text-center text-lg tracking-[0.4em] font-mono font-bold text-black focus:outline-none focus:border-black"
              />
              <p className="text-[10px] text-on-surface-variant text-center mt-1">
                Single-use OTP code valid for 5 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpTimer === 0}
              className="w-full py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-black/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating 4FA...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Complete 4FA Login</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setErrorMsg(''); }}
              className="w-full text-center text-[11px] text-on-surface-variant hover:text-black transition-colors font-medium cursor-pointer"
            >
              ← Back to Credential Verification
            </button>
          </form>
        )}

        {/* VIEW 3: Change Password Mode */}
        {mode === 'change_password' && (
          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Registered Admin Email *
              </label>
              <input
                type="email"
                required
                placeholder="jizajewellery@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-black"
              />
            </div>

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
                  placeholder="8208822696"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
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
              className="w-full py-3 bg-[#FCDAD7] hover:bg-[#F9C5C0] text-black font-label-md font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 border border-black/25 disabled:opacity-50 cursor-pointer mt-2"
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

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStep(1);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full text-center text-[11px] text-on-surface-variant hover:text-black transition-colors font-medium cursor-pointer"
            >
              ← Cancel &amp; Return to Login
            </button>
          </form>
        )}

        {/* Security Footer */}
        <div className="pt-3 border-t border-outline-variant/30 text-center text-[10px] text-on-surface-variant flex items-center justify-center gap-3">
          <span>🔒 256-Bit TLS</span>
          <span>⚡ Rate Limit Protection</span>
          <span>🛡️ 4FA Shielded</span>
        </div>

      </div>
    </div>
  );
}
