import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return <div className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">{children}</div>;
}
