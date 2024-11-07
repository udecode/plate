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
          startThreshold: 4,
        },
        boundaries: '#scroll_container',
        container: '#scroll_container',
        selectables: '#scroll_container .slate-selectable',
        selectionAreaClass: 'slate-selection-area',
      },
      enableContextMenu: true,
    },
  }),
] as const;
