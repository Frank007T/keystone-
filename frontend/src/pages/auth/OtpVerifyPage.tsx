import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../../lib/api';
import { Button } from '../../components/Button';

export function OtpVerifyPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleVerify = async () => {
    setError('');
    setSuccess('');

    try {
      await verifyOtp(email, otp);
      setSuccess('OTP verified! You may now login.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-90px)] max-w-3xl px-6 py-16 sm:px-8">
      <div className="rounded-[32px] bg-white p-10 shadow-soft">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Verify your email</p>
          <h1 className="text-3xl font-semibold text-slate-950">Complete your account verification</h1>
          <p className="text-sm leading-7 text-slate-600">
            Enter the OTP sent to your email address to activate your KEYSTONE account.
          </p>
        </div>
        <div className="mt-10 grid gap-5">
          <label className="space-y-2 text-sm text-slate-700">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="john.doe@example.com"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Verification Code</span>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Enter OTP"
            />
          </label>
          {error && <div className="rounded-[18px] bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
          {success && <div className="rounded-[18px] bg-success/10 px-4 py-3 text-sm text-success">{success}</div>}
          <Button onClick={handleVerify} className="w-full">
            Verify OTP
          </Button>
        </div>
      </div>
    </main>
  );
}
