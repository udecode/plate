'use client';

import { useTheme } from 'next-themes';
import { type ToasterProps, Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--popover-foreground)',
        } as React.CSSProperties
      }
      theme={theme as ToasterProps['theme']}
      {...props}
    />
  );
};

export { Toaster };
