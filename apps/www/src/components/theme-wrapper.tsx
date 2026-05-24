'use client';

import { useConfig } from '@/hooks/use-config';
import { cn } from '@/lib/utils';

export function ThemeWrapper({
  children,
  className,
}: React.ComponentProps<'div'>) {
  const [config] = useConfig();

  return (
    <div
      className={cn('themes-wrapper', 'w-full', className)}
      suppressHydrationWarning
      style={
        {
          '--radius': `${config.radius}rem`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
