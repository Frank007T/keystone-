import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';

export function WaitingApprovalPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-90px)] max-w-3xl px-6 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-[32px] bg-white p-10 shadow-soft"
      >
        <div className="grid gap-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-glow">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Awaiting approval</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950">Your account request is pending review</h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              A manager or super admin will review your request soon. You will receive an email once your account is approved.
            </p>
          </div>
          <Button asChild variant="secondary" className="mx-auto w-full sm:w-auto">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
