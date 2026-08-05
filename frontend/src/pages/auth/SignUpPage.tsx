import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { signup } from '../../lib/api';

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  companyName: z.string().min(2, 'Enter your company name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm your password'),
  acceptTerms: z.boolean().refine((value) => value, 'You must accept terms'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords must match',
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onTouched',
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setError('');
    setSuccess('');

    try {
      await signup({
        fullName: data.fullName,
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'customer',
      });

      setSuccess('Signup successful! Redirecting to verification...');
      setTimeout(() => {
        navigate('/verify-email', { state: { email: data.email } });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    }
  };

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-16 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <GlassCard className="bg-gradient-to-br from-primary to-secondary text-white shadow-glow p-10">
          <div className="space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary/20">KEYSTONE</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">Create your account</h1>
            </div>
            <div className="space-y-4 rounded-[24px] bg-white/10 p-6">
              <p className="text-base font-semibold">Faster Operations</p>
              <p className="text-base font-semibold">Better Productivity</p>
              <p className="text-base font-semibold">Live Tracking</p>
              <p className="text-base font-semibold">SLA Monitoring</p>
            </div>
            <p className="text-sm leading-7 text-white/80">
              Join KEYSTONE and experience a premium enterprise onboarding workflow designed for field service operations.
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sign up</p>
              <h2 className="text-3xl font-semibold text-slate-950">Start managing service operations.</h2>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
              {error && <div className="rounded-[18px] bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
              {success && <div className="rounded-[18px] bg-success/10 px-4 py-3 text-sm text-success">{success}</div>}

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Full Name</span>
                  <input
                    {...register('fullName')}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Jane Doe"
                  />
                  {errors.fullName && <span className="text-sm text-danger">{errors.fullName.message}</span>}
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Company Name</span>
                  <input
                    {...register('companyName')}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="BuildCo"
                  />
                  {errors.companyName && <span className="text-sm text-danger">{errors.companyName.message}</span>}
                </label>
              </div>

              <label className="space-y-2 text-sm text-slate-700">
                <span>Email</span>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="john.doe@example.com"
                />
                {errors.email && <span className="text-sm text-danger">{errors.email.message}</span>}
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                <span>Phone Number</span>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <span className="text-sm text-danger">{errors.phone.message}</span>}
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Password</span>
                  <input
                    {...register('password')}
                    type="password"
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Create a password"
                  />
                  {errors.password && <span className="text-sm text-danger">{errors.password.message}</span>}
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Confirm Password</span>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <span className="text-sm text-danger">{errors.confirmPassword.message}</span>}
                </label>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input {...register('acceptTerms')} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span>
                  I accept the <a href="#" className="font-semibold text-primary hover:text-secondary">Terms of Service</a> and <a href="#" className="font-semibold text-primary hover:text-secondary">Privacy Policy</a>.
                </span>
              </label>
              {errors.acceptTerms && <span className="text-sm text-danger">{errors.acceptTerms.message}</span>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Create Account
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-semibold text-primary hover:text-secondary">Login</Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
