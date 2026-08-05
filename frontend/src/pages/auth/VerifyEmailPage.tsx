import { motion } from 'framer-motion';
import { CheckCircle2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';

export function VerifyEmailPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-90px)] items-center justify-center px-6 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft"
      >
        <div className="grid gap-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-glow">
            <Mail className="h-8 w-8" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-slate-950">Verify your email</h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              We&apos;ve sent a verification email to your registered email address. Enter the OTP from that email on the next page to verify your account.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="primary" className="w-full">
              <a href="mailto:" target="_blank">Open Email App</a>
            </Button>
            <Button asChild variant="secondary" className="w-full">
              <a href="/verify-otp">Enter OTP</a>
            </Button>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-slate-600 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Resend available in</span>
              <span className="font-semibold text-slate-950">58 seconds</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Didn&apos;t receive the email? <Link to="/signup" className="font-semibold text-primary hover:text-secondary">Change email address</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
