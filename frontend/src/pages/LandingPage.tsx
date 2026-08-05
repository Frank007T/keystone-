import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart as RechartsPie, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';

const jobStatusData = [
  { name: 'Assigned', value: 28, color: '#7C5CFF' },
  { name: 'Completed', value: 42, color: '#5B3DF5' },
  { name: 'Overdue', value: 8, color: '#EF4444' },
];

const progressData = [
  { name: 'Jan', value: 88 },
  { name: 'Feb', value: 92 },
  { name: 'Mar', value: 95 },
  { name: 'Apr', value: 89 },
  { name: 'May', value: 94 },
];

const features = [
  { title: 'Smart Dispatch', icon: Sparkles, description: 'Assign the right technician on time with intelligent routing.' },
  { title: 'Real-Time Tracking', icon: Users, description: 'Monitor field progress with live updates and location data.' },
  { title: 'SLA Management', icon: ShieldCheck, description: 'Keep every service level agreement on track with alerts.' },
  { title: 'Powerful Reports', icon: TrendingUp, description: 'Generate operational insights and performance dashboards.' },
];

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative overflow-hidden bg-background py-14">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(91,61,245,0.14),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(124,92,255,0.12),_transparent_38%)]" />
        <div className="relative">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-xl">
                <Sparkles className="h-4 w-4" />
                Premium field service SaaS
              </div>
              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Field Service Management</p>
                <div className="max-w-3xl space-y-5">
                  <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-6xl">
                    Smarter Field Service.
                    <br />
                    Happier Customers.
                    <br />
                    Stronger Business.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    KEYSTONE helps service teams streamline work orders, dispatch the right technician, and close jobs on time with complete visibility.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="inline-flex items-center rounded-[16px] bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-secondary">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link to="/signup" className="inline-flex items-center rounded-[16px] border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300">
                  Raise Service Request
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] bg-white px-6 py-8 shadow-soft">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(91,61,245,0.14),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(124,92,255,0.12),_transparent_24%)]" />
              <div className="relative z-10 grid gap-8">
                <div className="rounded-[28px] border border-white/70 bg-slate-950/5 p-6 shadow-xl">
                  <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Today's Overview</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[20px] bg-white p-4 shadow-sm">
                          <p className="text-sm text-slate-500">New Jobs</p>
                          <p className="mt-3 text-2xl font-semibold text-slate-950">16</p>
                        </div>
                        <div className="rounded-[20px] bg-white p-4 shadow-sm">
                          <p className="text-sm text-slate-500">In Progress</p>
                          <p className="mt-3 text-2xl font-semibold text-slate-950">8</p>
                        </div>
                        <div className="rounded-[20px] bg-white p-4 shadow-sm">
                          <p className="text-sm text-slate-500">Completed</p>
                          <p className="mt-3 text-2xl font-semibold text-slate-950">24</p>
                        </div>
                        <div className="rounded-[20px] bg-white p-4 shadow-sm">
                          <p className="text-sm text-slate-500">Overdue</p>
                          <p className="mt-3 text-2xl font-semibold text-slate-950">3</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-primary/90 to-secondary p-6 text-white shadow-glow">
                      <div className="flex items-center justify-between">
                        <p className="text-sm uppercase tracking-[0.3em]">SLA Compliance</p>
                        <div className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase">On Track</div>
                      </div>
                      <div className="mt-5 flex items-center justify-center">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10 text-4xl font-semibold text-white shadow-soft">
                          92%
                        </div>
                      </div>
                      <p className="mt-5 text-sm leading-6 text-white/80">The team is ahead of schedule on core service deliveries this week.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[0.8fr_0.6fr]">
                  <GlassCard className="relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(124,92,255,0.15),_transparent_65%)]" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between text-slate-500">
                        <p className="text-sm uppercase tracking-[0.3em]">Job Status</p>
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          82% Complete
                        </div>
                      </div>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie width={260} height={260}>
                            <Pie data={jobStatusData} innerRadius={52} outerRadius={80} dataKey="value" nameKey="name" stroke="none">
                              {jobStatusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid gap-3">
                        {jobStatusData.map((item) => (
                          <div key={item.name} className="flex items-center justify-between text-sm text-slate-600">
                            <span className="flex items-center gap-2">
                              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </span>
                            <span className="font-semibold text-slate-950">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-slate-500">
                        <p className="text-sm uppercase tracking-[0.3em]">Performance</p>
                        <span className="text-xs font-semibold uppercase text-slate-400">7 day view</span>
                      </div>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie width={260} height={260}>
                            <Pie data={progressData} innerRadius={35} outerRadius={60} dataKey="value" nameKey="name" stroke="none">
                              {progressData.map((entry) => (
                                <Cell key={entry.name} fill="#A78BFA" />
                              ))}
                            </Pie>
                            <Tooltip cursor={false} />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 bg-slate-50 py-16">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Trusted by enterprise teams</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Built for modern field service organizations.</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              KEYS TONE delivers data-driven dispatch, SLA visibility, and reporting in a premium experience designed for enterprise operations.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['ACME Corp', 'BuildCo', 'InfraVista', 'TechPark', 'GreenWorks'].map((name) => (
              <div key={name} className="rounded-[24px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{name}</p>
                    <p className="text-sm text-slate-500">Enterprise operations</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
