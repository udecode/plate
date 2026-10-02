'use client';

import { Provider as JotaiProvider } from 'jotai';
import { installBrowserHandle } from 'platejs/react';

import { TooltipProvider } from '@/components/ui/tooltip';

import { ThemeProvider } from './theme-provider';

// platejs.org production builds drop the page handle; development servers and
// test builds made with NEXT_PUBLIC_PLATE_BROWSER_HANDLE=1 expose it.
if (
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_PLATE_BROWSER_HANDLE === '1'
) {
  installBrowserHandle();
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        enableColorScheme
        enableSystem
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </ThemeProvider>
    </JotaiProvider>
  );
}
