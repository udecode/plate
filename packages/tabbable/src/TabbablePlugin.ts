import { createPlugin, isVoid } from '@udecode/plate-common';

import type { TabbableEntry, TabbablePluginOptions } from './types';

import { TabbableEffects } from './TabbableEffects';

export const TabbablePlugin = createPlugin<'tabbable', TabbablePluginOptions>({
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
