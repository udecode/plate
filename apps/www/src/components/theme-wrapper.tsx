'use client';

import { useConfig } from '@/hooks/use-config';
import { cn } from '@/lib/utils';

import { ThemesStyle } from './themes-styles';

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
      className={cn(
        // `theme-${defaultTheme || config.theme}`,
        'themes-wrapper',
        'w-full',
        className
      )}
      style={
        {
          '--radius': `${defaultTheme ? 0.5 : config.radius}rem`,
        } as React.CSSProperties
      }
    >
      <ThemesStyle />

      {children}
    </div>
  );
}
