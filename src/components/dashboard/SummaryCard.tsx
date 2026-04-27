import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'default' | 'income' | 'expense' | 'balance';
}

export function SummaryCard({ title, value, subtitle, icon, variant = 'default' }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-float',
        variant === 'income' && 'bg-success/10 border border-success/20',
        variant === 'expense' && 'bg-destructive/10 border border-destructive/20',
        variant === 'balance' && 'gradient-hero text-primary-foreground',
        variant === 'default' && 'bg-card border border-border shadow-elegant'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p
            className={cn(
              'text-xs sm:text-sm font-medium',
              variant === 'balance' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'text-lg sm:text-2xl font-bold font-serif tracking-tight break-words',
              variant === 'income' && 'text-success',
              variant === 'expense' && 'text-destructive',
              variant === 'balance' && 'text-primary-foreground'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                'text-[11px] sm:text-xs',
                variant === 'balance' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl',
            variant === 'income' && 'bg-success/20 text-success',
            variant === 'expense' && 'bg-destructive/20 text-destructive',
            variant === 'balance' && 'bg-primary-foreground/20 text-primary-foreground',
            variant === 'default' && 'bg-primary/10 text-primary'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
