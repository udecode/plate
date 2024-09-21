'use client';

import { cn } from '@udecode/cn';

import { useConfig } from '@/hooks/use-config';

interface ThemeWrapperProps extends React.ComponentProps<'div'> {
  defaultTheme?: string;
}

export function ThemeWrapper({
  children,
  className,
  defaultTheme,
}: ThemeWrapperProps) {
  const [config] = useConfig();

  return (
    <div
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className={cn(
        `theme-${defaultTheme || config.theme}`,
        'w-full',
        className
      )}
      style={
        {
          '--radius': `${defaultTheme ? 0.5 : config.radius}rem`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
