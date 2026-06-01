'use client';

import * as React from 'react';

import { Tabs } from '@/components/ui/tabs';
import { useConfig } from '@/hooks/use-config';

export function CodeTabs({ children }: React.ComponentProps<typeof Tabs>) {
  const [config, setConfig] = useConfig();

  const installationType = config.installationType || 'cli';

  return (
    <Tabs
      className="relative mt-6 w-full"
      value={installationType}
      onValueChange={(value) =>
        setConfig({ ...config, installationType: value as 'cli' | 'manual' })
      }
    >
      {children}
    </Tabs>
  );
}
