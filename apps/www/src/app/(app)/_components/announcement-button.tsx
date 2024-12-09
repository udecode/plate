'use client';

import * as React from 'react';

import { ArrowRightIcon } from 'lucide-react';

import { Button } from '@/registry/default/plate-ui/button';

export function AnnouncementButton() {
  return (
    <Button
      size="lg"
      variant="link"
      className="group mb-2 inline-flex h-5 flex-wrap items-center gap-0 rounded-lg px-0.5 text-sm font-medium hover:no-underline"
      onClick={() => {
        window.open('https://pro.platejs.org', '_blank');
      }}
    >
      {/* <SparklesIcon />
      <Separator orientation="vertical" className="mx-2 h-4" /> */}
      <span className="whitespace-break-spaces underline-offset-4 group-hover:underline">
        <span>AI, Copilot, Upload, Math, and more</span>
        {/* <span className="bg-gradient-to-r from-[#6EB6F2] via-[#a855f7] to-[#eab308] bg-clip-text text-transparent">
          Plate Plus
        </span> */}
      </span>
      <ArrowRightIcon className="ml-2 size-6" />
    </Button>
  );
}
