'use client';

import * as React from 'react';

import { ArrowRightIcon } from 'lucide-react';

import { Button } from '@/registry/default/plate-ui/button';
import { Separator } from '@/registry/default/plate-ui/separator';

export function AnnouncementButton() {
  return (
    <Button
      size="lg"
      variant="link"
      className="group inline-flex items-center rounded-lg px-2 text-lg font-medium hover:no-underline"
      onClick={() => {
        window.open('https://pro.platejs.org', '_blank');
      }}
    >
      <span className="text-xl">🎉 </span>
      <Separator orientation="vertical" className="mx-3 h-6" />
      <span className="underline-offset-4 group-hover:underline">
        <span>Introducing the&nbsp;</span>
        <span className="bg-gradient-to-r from-[#6EB6F2] via-[#a855f7] to-[#eab308] bg-clip-text text-transparent">
          Plate Plus
        </span>
      </span>
      <ArrowRightIcon className="ml-2 size-6" />
    </Button>
  );
}
