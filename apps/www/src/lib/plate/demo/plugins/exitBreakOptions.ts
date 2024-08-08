import type { ExitBreakPluginOptions } from '@udecode/plate-break';

import { KEYS_HEADING } from '@udecode/plate-heading';

export const exitBreakOptions: Partial<ExitBreakPluginOptions> = {
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
};
