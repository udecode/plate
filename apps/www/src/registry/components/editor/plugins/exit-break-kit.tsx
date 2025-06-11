'use client';

import { ExitBreakPlugin } from '@udecode/plate';

export const ExitBreakKit = [
  ExitBreakPlugin.configure({
    shortcuts: {
      insert: { keys: 'mod+enter' },
      insertBefore: { keys: 'mod+shift+enter' },
    },
  }),
];
