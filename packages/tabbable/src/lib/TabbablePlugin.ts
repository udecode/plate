import { createTSlatePlugin, isVoid } from '@udecode/plate-common';

import type { TabbableEntry, TabblableConfig } from './types';

export const TabbablePlugin = createTSlatePlugin<TabblableConfig>({
  key: 'tabbable',
  options: {
    globalEventListener: false,
    insertTabbableEntries: () => [],
    query: () => true,
  },
}).extend(({ editor }) => ({
  options: {
    isTabbable: (tabbableEntry: TabbableEntry) =>
      isVoid(editor, tabbableEntry.slateNode),
  },
}));
