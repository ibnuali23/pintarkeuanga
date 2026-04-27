import { ReactNode } from 'react';
import { Header } from './Header';
import { FloatingActionButton } from '../FloatingActionButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="container py-4 pb-24 md:py-6 md:pb-6 max-w-full overflow-x-hidden">
        {children}
      </main>
      <FloatingActionButton />
    </div>
  );
}
