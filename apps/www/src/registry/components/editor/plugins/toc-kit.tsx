'use client';

import { TocPlugin } from '@platejs/toc/react';

import { TocElement } from '@/registry/ui/toc-node';

export const TocKit = [
  TocPlugin.withComponent(TocElement).configure({
    options: {
      // isScroll: true,
      topOffset: 80,
    },
  }),
];
