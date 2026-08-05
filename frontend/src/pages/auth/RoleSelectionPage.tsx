import { motion } from 'framer-motion';
import { Briefcase, Building2, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Customer',
    slug: 'customer',
    description: 'Raise service requests and track work orders.',
    icon: Building2,
    accent: 'from-primary to-secondary',
  },
  {
    title: 'Technician',
    slug: 'technician',
    description: 'Accept jobs and complete field service tasks.',
    icon: Wrench,
    accent: 'from-slate-500 to-slate-400',
  },
  {
    title: 'Dispatcher',
    slug: 'dispatcher',
    description: 'Manage schedules, dispatch technicians and routes.',
    icon: Briefcase,
    accent: 'from-emerald-500 to-emerald-400',
  },
  {
    title: 'Manager',
    slug: 'manager',
    description: 'Approve requests and oversee the operations team.',
    icon: ShieldCheck,
    accent: 'from-amber-500 to-orange-500',
  },
];

export function RoleSelectionPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-90px)] max-w-[1440px] px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-5 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Signup</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Choose your Keystone onboarding path</h1>
        <p className="max-w-2xl text-base leading-8 text-slate-600">
          Select the role that best describes your use case and proceed with a tailored enterprise signup workflow.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <motion.div
            key={card.slug}
            whileHover={{ y: -6, scale: 1.01 }}
            className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white/95 p-8 shadow-soft transition duration-300 hover:border-primary/40"
          >
            <div className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${card.accent} text-white shadow-glow`}>
              <card.icon className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-slate-950">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
            <Link
              to={`/signup/${card.slug}`}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary"
            >
              Continue
              <span className="block h-4 w-4 rounded-full bg-primary transition group-hover:bg-secondary" />
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
