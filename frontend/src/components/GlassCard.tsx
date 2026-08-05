import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  className?: string;
  children: ReactNode;
}

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-[24px] border border-white/60 bg-white/70 p-5 shadow-soft backdrop-blur-xl ${className ?? ''}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
