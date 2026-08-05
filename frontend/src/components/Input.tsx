import { clsx } from 'clsx';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className={clsx('relative', className)}>
      <input
        ref={ref}
        placeholder=" "
        className={clsx(
          'peer w-full rounded-[20px] border border-slate-200/70 bg-white/75 px-4 py-4 text-sm text-slate-950 outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 backdrop-blur-xl',
          className,
        )}
        {...props}
      />
      {label ? (
        <span className="pointer-events-none absolute left-4 top-4 text-sm text-slate-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary/90">
          {label}
        </span>
      ) : null}
      {error ? <span className="mt-2 block text-xs text-rose-600">{error}</span> : null}
    </div>
  ),
);
Input.displayName = 'Input';
