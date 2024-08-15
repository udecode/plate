import { createTPlugin, isVoid } from '@udecode/plate-common';

import type { TabbableEntry, TabblableConfig } from './types';

import { TabbableEffects } from './TabbableEffects';

export const TabbablePlugin = createTPlugin<TabblableConfig>({
  key: 'tabbable',
  options: {
    globalEventListener: false,
    insertTabbableEntries: () => [],
    query: () => true,
  },
  renderAfterEditable: TabbableEffects,
}).extend(({ editor }) => ({
  options: {
    isTabbable: (tabbableEntry: TabbableEntry) =>
      isVoid(editor, tabbableEntry.slateNode),
  },
}));
