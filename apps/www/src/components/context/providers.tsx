'use client';

import { Provider as JotaiProvider } from 'jotai';

import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
        enableSystem
      >
        {children}
      </ThemeProvider>
    </JotaiProvider>
  );
}
