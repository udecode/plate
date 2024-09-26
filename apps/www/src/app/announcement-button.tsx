'use client';

import * as React from 'react';

import { ArrowRightIcon } from 'lucide-react';

import { settingsStore } from '@/components/context/settings-store';
import { Button } from '@/registry/default/plate-ui/button';
import { Separator } from '@/registry/default/plate-ui/separator';

export function AnnouncementButton() {
  return (
    <Button
      size="none"
      variant="link"
      className="group inline-flex items-center rounded-lg px-0.5 text-sm font-medium hover:no-underline"
      onClick={() => {
        settingsStore.set.showSettings(true);
        settingsStore.set.customizerTab('plugins');
      }}
    >
      <span className="">🎉 </span>
      <Separator orientation="vertical" className="mx-2 h-4" />
      <span className="underline-offset-4 group-hover:underline">
        Introducing the interactive builder
      </span>
      <ArrowRightIcon className="ml-1 size-4" />
    </Button>
  );
}
