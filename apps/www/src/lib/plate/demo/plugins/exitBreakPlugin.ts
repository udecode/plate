import { ExitBreakPlugin, KEYS_HEADING } from '@udecode/plate';

import { MyPlatePlugin } from '@/plate/demo/plate.types';

export const exitBreakPlugin: Partial<MyPlatePlugin<ExitBreakPlugin>> = {
  options: {
    rules: [
      {
        hotkey: 'mod+enter',
      },
      {
        hotkey: 'mod+shift+enter',
        before: true,
      },
      {
        hotkey: 'enter',
        query: {
          start: true,
          end: true,
          allow: KEYS_HEADING,
        },
        relative: true,
        level: 1,
      },
    ],
  },
};
