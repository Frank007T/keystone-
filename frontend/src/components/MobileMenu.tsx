import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-xl"
        aria-label="Close menu"
      />

      <motion.aside
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="relative ml-auto flex h-full w-full max-w-[340px] flex-col overflow-hidden rounded-tl-[32px] rounded-bl-[32px] border border-white/30 bg-white/92 p-6 shadow-glass backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-semibold text-slate-950">Navigation</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-900 transition hover:border-slate-300"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className="block rounded-[20px] px-4 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto space-y-3 pb-6">
          <Link
            to="/login"
            onClick={onClose}
            className="block rounded-[20px] border border-slate-200/70 bg-white px-5 py-4 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            to="/signup"
            onClick={onClose}
            className="block rounded-[20px] bg-gradient-to-r from-primary via-secondary to-accent px-5 py-4 text-center text-sm font-semibold text-white shadow-glow transition hover:-translate-y-[1px]"
          >
            Raise Request
          </Link>
        </div>
      </motion.aside>
    </motion.div>
  );
}
