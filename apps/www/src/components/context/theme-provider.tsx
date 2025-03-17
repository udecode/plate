'use client';

import * as React from 'react';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    // Sync initial theme to cookie
    const theme = localStorage.getItem('theme') || 'system';
    document.cookie = `theme=${theme};path=/;max-age=31536000`;
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
