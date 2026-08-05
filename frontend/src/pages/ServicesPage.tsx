import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/SectionHeading';
import { GlassCard } from '@/components/GlassCard';
import { Container } from '@/components/Container';
import { Activity, CloudCog, Cpu, LayoutDashboard, Phone, Rocket, ShieldCheck, Sparkles } from 'lucide-react';

const services = [
  { icon: LayoutDashboard, title: 'Web Development', description: 'Modern SaaS platforms, landing pages, and admin experiences.' },
  { icon: Phone, title: 'Mobile Apps', description: 'Native-like mobile UIs for field service teams and customers.' },
  { icon: CloudCog, title: 'Cloud & DevOps', description: 'Scalable infrastructure and modern CI/CD workflows for growth.' },
  { icon: Cpu, title: 'Backend Systems', description: 'Robust APIs, data pipelines, and integrations for SaaS products.' },
  { icon: ShieldCheck, title: 'AI & Automation', description: 'Smart workflows, recommendations, and operational automation.' },
  { icon: Activity, title: 'UI/UX Design', description: 'Premium product experiences with strong visual polish and usability.' },
];

export function ServicesPage() {
  return (
    <main className="bg-background text-slate-950">
      <Container>
        <SectionHeading
          eyebrow="Services"
          title="Premium product engineering for modern SaaS brands."
          description="From visual design to engineering, we build digital products that look premium and perform beautifully."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45 }}
                className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-slate-950">{service.title}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">{service.description}</p>
                <button className="mt-8 inline-flex items-center rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent">
                  Learn More
                </button>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </main>
  );
}
