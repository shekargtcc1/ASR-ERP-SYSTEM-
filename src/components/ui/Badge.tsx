import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        {
          'border-transparent bg-slate-900 text-slate-50': variant === 'default',
          'border-transparent bg-slate-100 text-slate-900': variant === 'secondary',
          'border-transparent bg-red-100 text-red-700': variant === 'destructive',
          'text-slate-950': variant === 'outline',
          'border-transparent bg-emerald-100 text-emerald-700': variant === 'success',
        },
        className
      )}
      {...props}
    />
  );
}
