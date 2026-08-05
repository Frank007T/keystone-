import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/SectionHeading';
import { Container } from '@/components/Container';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { MapPin, Mail, Phone, Clock4 } from 'lucide-react';

export function ContactPage() {
  return (
    <main className="bg-background text-slate-950">
      <Container>
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch with the team behind premium business software."
          description="Reach out for product strategy, design systems, or custom SaaS engineering." 
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_0.7fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-3xl bg-primary/10 px-4 py-3 text-primary">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-semibold">Office Address</span>
              </div>
              <p className="text-sm text-slate-600">1984 Magnolia Lane, San Francisco, CA</p>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">hello@keystone.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">+1 (415) 555-0198</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock4 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Mon - Fri, 9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft"
          >
            <div className="grid gap-6">
              <Input label="Your Name" placeholder="Enter your full name" />
              <Input label="Email" type="email" placeholder="name@company.com" />
              <Input label="Subject" placeholder="Project, collaboration, or question" />
              <label className="block text-sm font-medium text-slate-700">
                Message
                <textarea
                  rows={5}
                  className="mt-3 w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Tell us more about your goals"
                />
              </label>
            </div>
            <div className="mt-8">
              <Button type="submit">Send Message</Button>
            </div>
          </motion.form>
        </div>
      </Container>
    </main>
  );
}
