'use client';

import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

export const blockSelectionPlugins = [
  BlockSelectionPlugin.configure({
    options: {
      areaOptions: {
        behaviour: {
          scrolling: {
            speedDivider: 1.5,
          },
          startThreshold: 10,
        },
      },
      enableContextMenu: true,
    },
  }),
] as const;
