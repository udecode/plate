'use client';

/* eslint-disable tailwindcss/no-custom-classname */
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useConfig } from '@/hooks/use-config';
import { useMounted } from '@/hooks/use-mounted';

interface ThemeBodyProps extends React.ComponentProps<'body'> {
  defaultTheme?: string;
}

export function Body({ defaultTheme, children, className }: ThemeBodyProps) {
  const [config] = useConfig();
  const pathname = usePathname();
  const mounted = useMounted();

  const theme =
    mounted && pathname === '/'
      ? `theme-${config.theme ?? defaultTheme}`
      : `theme-${defaultTheme}`;

  return (
    <body
      className={cn(theme, className)}
      style={
        {
          '--radius': `${config.radius ?? 0.5}rem`,
        } as React.CSSProperties
      }
    >
      {children}
    </body>
  );
}
