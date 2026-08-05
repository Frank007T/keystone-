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
  primary:
    'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-glow hover:-translate-y-[1px] hover:shadow-[0_24px_64px_rgba(109,40,217,0.18)] focus-visible:ring-2 focus-visible:ring-primary/40',
  secondary:
    'bg-white/80 text-slate-950 border border-slate-200/70 shadow-soft hover:bg-white focus-visible:ring-2 focus-visible:ring-primary/20',
  ghost:
    'bg-transparent text-slate-950 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/20',
};

export function Button({ children, variant = 'primary', asChild, className, type = 'button', disabled, onClick }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const commonProps = {
    className: clsx(
      'inline-flex items-center justify-center gap-2 rounded-[18px] px-6 py-3 text-sm font-semibold transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-60',
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
