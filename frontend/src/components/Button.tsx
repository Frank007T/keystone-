import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import { MouseEventHandler, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  asChild?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
}

const variants = {
  primary: 'bg-primary text-white shadow-soft hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm',
  ghost: 'bg-transparent text-slate-900 hover:bg-slate-100',
};

export function Button({ children, variant = 'primary', asChild, className, type = 'button', disabled, onClick }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const commonProps = {
    className: clsx(
      'inline-flex items-center justify-center gap-2 rounded-[16px] px-6 py-3 text-sm font-semibold transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      className,
    ),
    onClick,
  };

  if (asChild) {
    return <Comp {...commonProps}>{children}</Comp>;
  }

  return (
    <button type={type} disabled={disabled} {...commonProps}>
      {children}
    </button>
  );
}
