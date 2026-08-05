import { motion } from 'framer-motion';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary/90">{eyebrow}</p>
        ) : null}
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-5xl">{title}</h2>
        {description ? (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
