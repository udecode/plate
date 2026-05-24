'use client';

import * as React from 'react';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

function ThemeShortcut() {
  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'd' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      if (
        (event.target instanceof HTMLElement &&
          event.target.isContentEditable) ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      event.preventDefault();
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    document.addEventListener('keydown', down);

    return () => document.removeEventListener('keydown', down);
  }, [resolvedTheme, setTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    // Sync initial theme to cookie
    const theme = localStorage.getItem('theme') || 'system';
    document.cookie = `theme=${theme};path=/;max-age=31536000`;
  }, []);

  return (
    <NextThemesProvider {...props}>
      <ThemeShortcut />
      {children}
    </NextThemesProvider>
  );
}
