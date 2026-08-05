import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/SectionHeading';
import { GlassCard } from '@/components/GlassCard';
import { Container } from '@/components/Container';
import { ShieldCheck, Sparkles, Users, TrendingUp } from 'lucide-react';

const values = [
  { title: 'Integrity', description: 'Transparency and ethics in every interaction.' },
  { title: 'Innovation', description: 'Build modern experiences with clean, scalable systems.' },
  { title: 'Collaboration', description: 'Cross-functional teams aligned around customer success.' },
  { title: 'Excellence', description: 'High standards for design, delivery, and performance.' },
];

export function AboutPage() {
  return (
    <main className="bg-background text-slate-950">
      <div className="bg-[radial-gradient(circle_at_top_left,_rgba(124,92,255,0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(124,92,255,0.08),_transparent_35%)] py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.95fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.32em] text-primary/80">About Us</p>
              <h1 className="max-w-3xl text-5xl font-bold leading-tight text-slate-950 sm:text-6xl">
                We help growth-minded businesses launch modern digital products.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Keystone blends strategy, design, and technology to deliver premium SaaS experiences that feel elegant, intuitive, and fast.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-6 shadow-soft">
                  <div className="inline-flex items-center justify-center rounded-3xl bg-primary/10 p-3 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">Mission</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Create thoughtful SaaS products that drive efficiency and delight users.</p>
                </div>
                <div className="rounded-[24px] bg-white p-6 shadow-soft">
                  <div className="inline-flex items-center justify-center rounded-3xl bg-secondary/10 p-3 text-secondary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-950">Vision</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Empower teams to run service operations with clarity, speed, and confidence.</p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-soft"
            >
              <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgba(124,92,255,0.14),_transparent_45%)]" />
              <div className="relative z-10 space-y-6">
                <div className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft">
                  <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Core Focus</p>
                  <h2 className="mt-4 text-3xl font-bold">SaaS product strategy made simple.</h2>
                  <p className="mt-4 text-sm leading-6 text-slate-200">From research to launch, we partner with teams to create products that scale.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {values.map((value) => (
                    <GlassCard key={value.title} className="bg-white/85">
                      <h3 className="text-lg font-semibold text-slate-950">{value.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{value.description}</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      <Container>
        <SectionHeading
          eyebrow="Our values"
          title="Built on focus, transparency, and craftsmanship."
          description="Every product team we work with gets a polished digital experience with a clear roadmap, modern UI, and fast interactions."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {values.map((value) => (
            <GlassCard key={value.title} className="p-8">
              <h3 className="text-xl font-semibold text-slate-950">{value.title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">{value.description}</p>
            </GlassCard>
          ))}
        </div>
      </Container>
    </main>
  );
}
