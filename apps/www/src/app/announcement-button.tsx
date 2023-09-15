'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';

import { settingsStore } from '@/components/context/settings-store';
import { Button } from '@/registry/default/plate-ui/button';
import { Separator } from '@/registry/default/plate-ui/separator';

export function AnnouncementButton() {
  return (
    <Button
      variant="secondary"
      className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium"
      onClick={() => {
        settingsStore.set.showSettings(true);
        settingsStore.set.customizerTab('plugins');
      }}
    >
      🎉 <Separator className="mx-2 h-4" orientation="vertical" /> Introducing
      the interactive builder.
      <ChevronRight className="ml-1 h-4 w-4" />
    </Button>
  );
}
