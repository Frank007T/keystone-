import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { login } from '../../lib/api';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: 'onTouched',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setSuccess('');

    try {
      // Backend returns: { token, email, role }
      const result = await login(data);
      
      localStorage.setItem('keystoneToken', result.token);
      localStorage.setItem('userRole', result.role);
      localStorage.setItem('userEmail', result.email);

      setSuccess('Login successful. Redirecting to your dashboard...');

      // Standardized role extraction
      const role = result.role?.toUpperCase();
     // Inside LoginPage.tsx onSubmit handler:


switch (role) {
  case 'SUPER_ADMIN':
  case 'ADMIN':
    navigate('/admin', { replace: true });
    break;
  case 'MANAGER':
    navigate('/portal/manager', { replace: true });
    break;
  case 'DISPATCHER':
    navigate('/portal/dispatcher', { replace: true });
    break;
  case 'TECHNICIAN':
    navigate('/portal/technician', { replace: true });
    break;
  case 'CUSTOMER':
    navigate('/portal/customer', { replace: true });
    break;
  default:
    navigate('/', { replace: true });
    break;
}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-90px)] max-w-[1440px] px-6 py-16 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.section
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[32px] bg-gradient-to-br from-primary to-secondary p-10 text-white shadow-glow"
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/20">Welcome Back</p>
            <h1 className="text-4xl font-semibold">Login to continue managing field services.</h1>
            <p className="max-w-xl text-base leading-7 text-white/80">
              Access dispatch tools, work order history, and service analytics from a secure enterprise experience.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[32px] bg-white p-10 shadow-soft"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-950">Login</h2>
              <p className="text-sm text-slate-500">Enter your credentials to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
              {error && <div className="rounded-[18px] bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
              {success && <div className="rounded-[18px] bg-success/10 px-4 py-3 text-sm text-success">{success}</div>}

              <label className="space-y-2 text-sm text-slate-700">
                <span>Email</span>
                <input
                  {...register('email', { required: 'Email is required' })}
                  type="email"
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="john.doe@example.com"
                />
                {errors.email && <span className="text-sm text-danger">{errors.email.message}</span>}
              </label>

              <label className="space-y-2 text-sm text-slate-700">
                <span>Password</span>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type="password"
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Enter your password"
                />
                {errors.password && <span className="text-sm text-danger">{errors.password.message}</span>}
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:text-secondary">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Authenticating...' : 'Login'}
              </Button>

              <div className="relative py-3 text-sm text-slate-500">
                <span className="absolute inset-x-0 top-1/2 h-px bg-slate-200"></span>
                <span className="relative inline-block bg-white px-3">OR</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="ghost" type="button" className="w-full border border-slate-200 text-slate-900">
                  Continue with Google
                </Button>
                <Button variant="ghost" type="button" className="w-full border border-slate-200 text-slate-900">
                  Continue with Microsoft
                </Button>
              </div>

              <p className="text-center text-sm text-slate-500">
                Don&apos;t have an account? <Link to="/signup" className="font-semibold text-primary hover:text-secondary">Sign Up</Link>
              </p>
            </form>
          </div>
        </motion.section>
      </div>
    </main>
  );
}