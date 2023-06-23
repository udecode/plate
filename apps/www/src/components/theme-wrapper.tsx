'use client';

import { useConfig } from '@/hooks/use-config';
import { cn } from '@/lib/utils';

export function ThemeWrapper({ children }: React.ComponentProps<'div'>) {
  const [config] = useConfig();

  return (
    // eslint-disable-next-line tailwindcss/no-custom-classname
    <div className={cn(`theme-${config.theme}`, 'w-full')}>{children}</div>
  );
}
