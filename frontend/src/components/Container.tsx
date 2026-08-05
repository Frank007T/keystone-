import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

export function Container({ children }: ContainerProps) {
  return <div className="mx-auto w-full max-w-[1400px] px-6 py-10 sm:px-8 lg:px-10">{children}</div>;
}
