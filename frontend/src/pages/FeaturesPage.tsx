import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/SectionHeading';
import { Container } from '@/components/Container';
import { CheckCircle2, LayoutDashboard, Sparkles, ShieldCheck, Users } from 'lucide-react';

const features = [
  { title: 'Faster onboarding', detail: 'A guided experience that helps teams adopt new workflows quickly.' },
  { title: 'Live performance metrics', detail: 'Real-time dashboards display the health of every service request.' },
  { title: 'Smart automation', detail: 'Reduce manual effort with intelligent alerts and auto-routing.' },
  { title: 'Unified communication', detail: 'Connect customers, dispatchers, and technicians in one flow.' },
];

export function FeaturesPage() {
  return (
    <main className="bg-background text-slate-950">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Tools and insights that keep service teams in control."
          description="A modern product built for speed, reliability, and seamless collaboration across operations."
        />

        <div className="mt-12 grid gap-6 xl:grid-cols-[0.9fr_0.6fr]">
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
              className="rounded-[28px] bg-white p-8 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-primary/80">Productivity</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-950">A faster way to manage service operations.</h2>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-600">Deliver a premium experience to customers and teams with automated workflows, intelligent assignment, and real-time visibility.</p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{feature.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-soft">
            <div className="grid gap-6">
              <div className="rounded-[28px] border border-slate-200 p-6">
                <div className="flex items-center gap-3 text-primary">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.32em]">Why choose us</p>
                </div>
                <p className="mt-4 text-lg font-semibold text-slate-950">Design-led SaaS with polished UI and conversion-focused workflows.</p>
              </div>
              <div className="grid gap-4 rounded-[28px] bg-slate-950 p-6 text-white shadow-soft">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.32em] text-primary/80">Workflow</p>
                  <h3 className="text-2xl font-semibold">Launch faster, iterate better.</h3>
                </div>
                <div className="space-y-4 text-sm leading-6">
                  <p>- Rapid UI enhancements with tight feedback loops.</p>
                  <p>- Clear data surfaces for customer service and operations.</p>
                  <p>- Scalable architecture that grows with your product.</p>
                </div>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-secondary" />
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-secondary">Trust</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">Reliable code, secure integrations, and delightful product quality across every page.</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
