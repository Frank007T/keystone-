import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../lib/api';
import { Button } from '../../components/Button';

const customerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  companyName: z.string().min(2, 'Enter your company name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm your password'),
});

export function CustomerSignupPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: z.infer<typeof customerSchema>) => {
    setError('');
    setSuccess('');

    try {
      await signup({
        ...data,
        role: 'customer',
      });
      setSuccess('Signup successful. Check your email for the OTP.');
      setTimeout(() => navigate('/verify-otp'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register customer.');
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-90px)] max-w-4xl px-6 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-[32px] bg-white p-10 shadow-soft"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Customer Signup</p>
          <h1 className="text-4xl font-semibold text-slate-950">Create your customer account</h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
            Raise service requests, monitor progress, and stay connected to the service team.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid gap-5">
          {error && <div className="rounded-[18px] bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
          {success && <div className="rounded-[18px] bg-success/10 px-4 py-3 text-sm text-success">{success}</div>}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Full Name</span>
              <input
                {...register('fullName')}
                className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Jane Doe"
              />
              {errors.fullName && <span className="text-sm text-danger">{errors.fullName.message}</span>}
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Company Name</span>
              <input
                {...register('companyName')}
                className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Acme Corp"
              />
              {errors.companyName && <span className="text-sm text-danger">{errors.companyName.message}</span>}
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Email address</span>
              <input
                {...register('email')}
                type="email"
                className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="john.doe@example.com"
              />
              {errors.email && <span className="text-sm text-danger">{errors.email.message}</span>}
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Phone Number</span>
              <input
                {...register('phone')}
                className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="(555) 123-4567"
              />
              {errors.phone && <span className="text-sm text-danger">{errors.phone.message}</span>}
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>Password</span>
              <input
                {...register('password')}
                type="password"
                className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Create a password"
              />
              {errors.password && <span className="text-sm text-danger">{errors.password.message}</span>}
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>Confirm Password</span>
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <span className="text-sm text-danger">{errors.confirmPassword.message}</span>}
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Create Customer Account
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
