import { motion } from 'framer-motion';
import { Briefcase, Building2, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
  {
    title: 'Dispatcher',
    slug: 'dispatcher',
    description: 'Create and assign work orders',
    icon: Briefcase,
    accent: 'from-primary to-secondary',
  },
  {
    title: 'Technician',
    slug: 'technician',
    description: 'Complete assigned work orders',
    icon: Wrench,
    accent: 'from-slate-500 to-slate-400',
  },
  {
    title: 'Customer',
    slug: 'customer',
    description: 'Raise maintenance requests',
    icon: Building2,
    accent: 'from-emerald-500 to-emerald-400',
  },
  {
    title: 'Manager/Admin',
    slug: 'manager',
    description: 'Manage the entire platform',
    icon: ShieldCheck,
    accent: 'from-amber-500 to-orange-500',
  },
];

export function ChooseRolePage() {
  return (
    <main className="mx-auto max-w-[1440px] px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-4xl space-y-5 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Choose your role</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Select your role to continue</h1>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map((role) => (
          <motion.div
            key={role.title}
            whileHover={{ scale: 1.02 }}
            className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-8 text-left shadow-soft transition duration-300 hover:border-primary/30"
          >
            <div className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${role.accent} text-white shadow-glow`}>
              <role.icon className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-950">{role.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{role.description}</p>
            <Link
              to={`/signup?role=${role.slug}`}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition group-hover:text-secondary"
            >
              Continue
            </Link>
            <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-transparent transition group-hover:border-primary/20" />
          </motion.div>
        ))}
      </div>
    </main>
  );
}
