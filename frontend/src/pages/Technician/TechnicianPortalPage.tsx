import { motion } from 'framer-motion';

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

export function TechnicianPortalPage() {
  return (
    <motion.main
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={{ duration: 0.45 }}
      className="mx-auto min-h-[calc(100vh-90px)] max-w-6xl px-6 py-16 sm:px-8"
    >
      <div className="rounded-[32px] bg-white p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Technician Portal</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Welcome to your technician workspace</h1>
        <p className="mt-4 text-slate-600">
          Access assigned jobs, update work status, and view customer details for your next service calls.
        </p>
      </div>
    </motion.main>
  );
}
