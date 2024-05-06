'use client';

import { TooltipProvider } from '@/registry/default/plate-ui/tooltip';

import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem
    >
      <TooltipProvider
        delayDuration={500}
        disableHoverableContent
        skipDelayDuration={0}
      >
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}
