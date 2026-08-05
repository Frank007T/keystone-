import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../lib/api';

type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword(email);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate OTP format locally & proceed to new password
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }

    // Move to password input (API validates OTP in the final submission)
    setStep('NEW_PASSWORD');
  };

  // Step 3: Reset Password via API
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, otp, newPassword);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please verify your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full text-slate-900">
      {/* Left Promo Banner */}
      <div className="hidden w-1/2 bg-indigo-600 p-12 lg:flex lg:flex-col lg:justify-between text-white">
        <div className="my-auto space-y-6 max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight">
            Account Recovery Made Simple.
          </h1>
          <p className="text-indigo-100 text-lg">
            Follow the steps to securely verify your identity and reset your password to regain access to your dashboard.
          </p>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 bg-slate-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
          
          {/* STEP 1: Request OTP */}
          {step === 'EMAIL' && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your registered email address to receive a verification OTP.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john.doe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-xs font-semibold text-indigo-600 hover:underline">
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Verify OTP</h2>
                <p className="text-sm text-slate-500 mt-1">
                  We've sent a code to <span className="font-semibold text-slate-700">{email}</span>.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-center text-lg font-mono tracking-widest text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700"
              >
                Continue
              </button>

              <div className="flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="font-semibold text-slate-500 hover:underline"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={loading}
                  className="font-semibold text-indigo-600 hover:underline disabled:opacity-50"
                >
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Set New Password */}
          {step === 'NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Set New Password</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Please enter your new password below.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* STEP 4: Success Message */}
          {step === 'SUCCESS' && (
            <div className="text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Password Reset Complete!</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Your password has been changed successfully. You can now log in with your new credentials.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700"
              >
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}