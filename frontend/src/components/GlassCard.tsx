import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  className?: string;
  children: ReactNode;
}

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-[28px] border border-white/30 bg-white/75 p-6 shadow-glass backdrop-blur-2xl transition-transform duration-300 ${className ?? ''}`}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
