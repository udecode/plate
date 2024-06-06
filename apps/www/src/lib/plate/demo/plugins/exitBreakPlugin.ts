import type { ExitBreakPlugin } from '@udecode/plate-break';
import type { PlatePlugin } from '@udecode/plate-common';

import { KEYS_HEADING } from '@udecode/plate-heading';

export const exitBreakPlugin: Partial<PlatePlugin<ExitBreakPlugin>> = {
  options: {
    rules: [
      {
        hotkey: 'mod+enter',
      },
      {
        before: true,
        hotkey: 'mod+shift+enter',
      },
      {
        hotkey: 'enter',
        level: 1,
        query: {
          allow: KEYS_HEADING,
          end: true,
          start: true,
        },
        relative: true,
      },
    ],
  },
};
