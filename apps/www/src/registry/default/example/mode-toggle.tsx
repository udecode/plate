'use client';

import * as React from 'react';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useMounted } from '@/registry/default/hooks/use-mounted';
import { Button } from '@/registry/default/plate-ui/button';

export default function ModeToggle() {
  const { setTheme, theme } = useTheme();

  const mounted = useMounted();

  return (
    <Button
      size="sm"
      variant="ghost"
      className="size-8 px-0"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {mounted && theme === 'dark' ? (
        <MoonIcon className="size-[1.2rem]" />
      ) : (
        <SunIcon className="size-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
