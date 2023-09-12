'use client';

/* eslint-disable tailwindcss/no-custom-classname */
import { cn } from '@/lib/utils';
import { useConfig } from '@/hooks/use-config';

interface ThemeWrapperProps extends React.ComponentProps<'div'> {
  defaultTheme?: string;
}

export function ThemeWrapper({
  defaultTheme,
  children,
  className,
}: ThemeWrapperProps) {
  const [config] = useConfig();

  return (
    <div
      className={cn(
        `theme-${config.theme ?? defaultTheme}`,
        'w-full',
        className
      )}
      style={
        {
          '--radius': `${config.radius ?? 0.5}rem`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
