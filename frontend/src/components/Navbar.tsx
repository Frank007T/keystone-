import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Contact', href: '/#contact' },
];

export function Navbar() {
  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-4 sm:px-8">
        <Link to="/" className="font-semibold text-xl text-slate-950">
          KEYSTONE
        </Link>

        <nav className="hidden items-center gap-4 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `text-sm font-medium text-slate-600 transition hover:text-slate-900 ${isActive ? 'text-slate-900' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-[16px] bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-secondary"
          >
            Raise Request
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
