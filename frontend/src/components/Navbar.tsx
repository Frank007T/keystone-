import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { MobileMenu } from '@/components/MobileMenu';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 28);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`sticky top-4 z-50 mx-auto w-full max-w-[1400px] rounded-[28px] border border-white/40 bg-white/75 backdrop-blur-2xl transition duration-300 ${
        isScrolled ? 'shadow-glass' : 'shadow-none'
      }`}
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex h-[80px] items-center justify-between gap-6 px-6 py-3 sm:px-8">
        <Link to="/" className="text-xl font-semibold tracking-[0.16em] text-slate-950">
          KEYSTONE
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `relative text-sm font-semibold transition ${
                  isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {item.label}
              <span
                className={`absolute left-0 -bottom-2 h-1 rounded-full bg-gradient-to-r from-primary via-secondary to-accent transition-all ${
                  'w-full opacity-100' + (window.location.pathname === item.href ? '' : ' opacity-0')
                }`}
              />
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-[18px] border border-slate-200/70 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-white"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-[18px] bg-gradient-to-r from-primary via-secondary to-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-[1px]"
          >
            Raise Request
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((state) => !state)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/90 text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-white lg:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>{isOpen ? <MobileMenu onClose={() => setIsOpen(false)} /> : null}</AnimatePresence>
    </motion.header>
  );
}
