'use client';

import * as React from 'react';
import { ArrowRightIcon } from 'lucide-react';

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
      <ArrowRightIcon className="ml-1 size-4" />
    </Button>
  );
}
