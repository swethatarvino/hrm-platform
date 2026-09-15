import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface LoginPageProps {
  onOpenThemeModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const { login, requestPasswordReset, verifyAndResetPassword } = useAuth();
  const { config } = useOrg();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Password reset flow state
  const [resetStep, setResetStep] = useState<number>(1);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetTargetPersonalEmail, setResetTargetPersonalEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [lastDispatchedCode, setLastDispatchedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const handleRequestReset = () => {
    setResetError(null);
    setResetLoading(true);
    setTimeout(() => {
      const res = requestPasswordReset(resetIdentifier);
      setResetLoading(false);
      if (!res.success) {
        setResetError(res.error || 'Failed to dispatch recovery code.');
      } else {
        setResetTargetPersonalEmail(res.personalEmail || resetIdentifier);
        setLastDispatchedCode(res.code || '');
        setResetSuccessMsg(res.message || 'Recovery code dispatched successfully.');
        setResetStep(2);
      }
    }, 300);
  };

  const handleConfirmResetPassword = () => {
    setResetError(null);
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetLoading(true);
    setTimeout(() => {
      const res = verifyAndResetPassword(resetCode, newPassword);
      setResetLoading(false);
      if (!res.success) {
        setResetError(res.error || 'Verification failed.');
      } else {
        setResetStep(4);
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your corporate email, personal email, or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(identifier.trim(), password.trim());
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please check your email/username and password.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col justify-between p-4 sm:p-6 text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Top Bar with Brand */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm tracking-wider shadow-lg shadow-purple-500/25">
            {config.logoText.slice(0, 4)}
          </div>
          <div>
            <span className="font-black text-base text-white tracking-wide block leading-tight">{config.name}</span>
            <span className="text-[11px] text-pink-300 font-bold tracking-wider uppercase">Enterprise HRM</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-purple-500/30 text-purple-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Zero-Trust Auth</span>
          </div>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200/90 relative overflow-hidden">
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600"></div>

          {/* Brand Header */}
          <div className="text-center mt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-pink-600" />
              <span>Unified Login Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Enter your corporate credentials. The backend automatically determines your role and workspace permissions.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Common Login Form (No role selector, No Admin/Employee switch) */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
            {/* Field 1: Email ID / Username */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Email ID or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. shwetha@apextech.io or david.miller"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium placeholder:text-slate-400 text-sm transition-all"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-900 font-medium placeholder:text-slate-400 text-sm transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default password: <code className="text-purple-600 font-mono font-bold">Password@123</code> or <code className="text-purple-600 font-mono font-bold">password@123</code>
              </p>
            </div>

            {/* Field 3: Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/25 mt-3 disabled:opacity-60 text-sm"
            >
              <span>{isSubmitting ? 'Authenticating with Backend...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security & Access Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 bg-slate-50/70 p-3 rounded-2xl">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              <strong>Role-based access:</strong> Roles are enforced by the server. Directors access executive controls; employees access their personal workspace.
            </span>
          </div>
        </div>

        {/* Corporate Notice */}
        <div className="mt-5 text-center text-xs text-slate-400 space-y-1">
          <p className="text-[11px] text-slate-400">
            Accounts are managed by Director / Admin (Shwetha). Contact administration for new employee accounts.
          </p>
        </div>
      </div>

      {/* Forgot Password & Reset Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-slate-900 shadow-2xl border border-slate-200 text-xs relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Employee Password</h3>
                  <p className="text-[11px] text-slate-500">Self-service credential recovery via personal email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetStep(1);
                  setResetError(null);
                  setResetSuccessMsg(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stepper indicator */}
            <div className="flex items-center justify-between my-4 px-2">
              <div className={`flex items-center gap-1.5 font-bold text-[11px] ${resetStep >= 1 ? 'text-purple-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${resetStep >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
                <span>Identify</span>
              </div>
              <div className={`h-0.5 w-8 ${resetStep >= 2 ? 'bg-purple-600' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center gap-1.5 font-bold text-[11px] ${resetStep >= 2 ? 'text-purple-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${resetStep >= 2 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                <span>Verify Code</span>
              </div>
              <div className={`h-0.5 w-8 ${resetStep >= 3 ? 'bg-purple-600' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center gap-1.5 font-bold text-[11px] ${resetStep >= 3 ? 'text-purple-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${resetStep >= 3 ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                <span>New Password</span>
              </div>
            </div>

            {/* Error banner */}
            {resetError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {/* Success banner */}
            {resetSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* Step 1: Enter email */}
            {resetStep === 1 && (
              <div className="space-y-4">
                <p className="text-slate-600 text-xs leading-relaxed">
                  Enter your corporate office email (e.g. <code className="text-purple-700 font-mono">david.miller@apextech.io</code>) or original personal email address. A 6-digit recovery code will be dispatched to your personal inbox.
                </p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate or Personal Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      placeholder="e.g. david.miller@apextech.io or david.miller.personal@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-xs text-slate-900"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={resetLoading || !resetIdentifier.trim()}
                    onClick={handleRequestReset}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Recovery Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Enter 6-digit recovery code */}
            {resetStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 leading-relaxed">
                  A 6-digit verification code has been dispatched to your personal email (<strong className="font-mono text-purple-700">{resetTargetPersonalEmail}</strong>).
                  {lastDispatchedCode && (
                    <div className="mt-2 pt-2 border-t border-purple-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-purple-600">Simulated Outbox Code:</span>
                      <button
                        type="button"
                        onClick={() => setResetCode(lastDispatchedCode)}
                        className="px-2 py-0.5 rounded bg-purple-200 hover:bg-purple-300 text-purple-900 font-mono font-bold cursor-pointer transition-colors"
                        title="Click to auto-fill code"
                      >
                        Auto-fill: {lastDispatchedCode}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    className="w-full tracking-widest text-center text-lg font-mono font-bold py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
                    autoFocus
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    ← Back to Email
                  </button>
                  <button
                    type="button"
                    disabled={resetCode.length !== 6}
                    onClick={() => {
                      setResetError(null);
                      setResetStep(3);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                  >
                    Proceed to Set Password
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Set New Password */}
            {resetStep === 3 && (
              <div className="space-y-4">
                <p className="text-slate-600 text-xs">
                  Create a new secure password for your corporate account.
                </p>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password (min. 6 characters)</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-xs text-slate-900"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-xs text-slate-900"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(2)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={resetLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                    onClick={handleConfirmResetPassword}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Save New Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Reset Success */}
            {resetStep === 4 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Password Reset Complete!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Your password has been updated and cryptographically salted in the backend. You can now sign in with your corporate or personal email and new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setIdentifier(resetIdentifier);
                    setPassword(newPassword);
                    setResetStep(1);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/25"
                >
                  Sign In with New Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-500 py-2">
        &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
      </div>
    </div>
  );
};
