'use client';

import { TooltipProvider } from '@/registry/default/plate-ui/tooltip';

import { ThemeProvider } from './theme-provider';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider
        disableHoverableContent
        delayDuration={500}
        skipDelayDuration={0}
      >
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}
