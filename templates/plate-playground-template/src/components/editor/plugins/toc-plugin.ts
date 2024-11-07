'use client';

import { TocPlugin } from '@udecode/plate-heading/react';

export const tocPlugin = TocPlugin.configure({
  options: {
    // isScroll: true,
    scrollContainerSelector: '#scroll_container',
    topOffset: 80,
  },
});
