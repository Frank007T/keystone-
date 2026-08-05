import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/SectionHeading';
import { Container } from '@/components/Container';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'For early-stage teams launching their first product.',
    features: ['Up to 3 projects', 'Basic analytics', 'Email support', 'Core integrations'],
  },
  {
    name: 'Professional',
    price: '$79',
    description: 'For growing teams that need automation and reporting.',
    features: ['Unlimited projects', 'Advanced dashboards', 'Workflow automation', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large teams that require custom SLAs and services.',
    features: ['Custom onboarding', 'Dedicated support', 'Enterprise security', 'Custom integrations'],
  },
];

export function PricingPage() {
  return (
    <main className="bg-background text-slate-950">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Flexible plans for every stage of your business."
          description="Pick the plan that matches your team and scale with confidence." 
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45 }}
              className={`rounded-[32px] border p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-glow ${plan.highlighted ? 'border-primary/20 bg-primary/5' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-950">{plan.name}</p>
                {plan.highlighted ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Most popular</span> : null}
              </div>
              <p className="mt-6 text-4xl font-bold tracking-tight text-slate-950">{plan.price}</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`mt-10 w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition ${plan.highlighted ? 'bg-primary hover:bg-secondary' : 'bg-slate-950 hover:bg-slate-800'}`}>
                Choose plan
              </button>
            </motion.article>
          ))}
        </div>
      </Container>
    </main>
  );
}
