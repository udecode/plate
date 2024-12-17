'use client';

import * as React from 'react';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { META_THEME_COLORS } from '@/config/site';
import { useMetaColor } from '@/hooks/use-meta-color';
import { Button } from '@/registry/default/plate-ui/button';

export function ModeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const { setMetaColor } = useMetaColor();
  const toggleTheme = React.useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    // Set cookie when theme changes
    document.cookie = `theme=${newTheme};path=/;max-age=31536000`; // 1 year

    setMetaColor(
      resolvedTheme === 'dark'
        ? META_THEME_COLORS.light
        : META_THEME_COLORS.dark
    );
  }, [resolvedTheme, setTheme, setMetaColor]);

  return (
    <Button
      variant="ghost"
      className="group/toggle size-8 px-0"
      onClick={toggleTheme}
    >
      <SunIcon className="hidden [html.dark_&]:block" />
      <MoonIcon className="hidden [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
