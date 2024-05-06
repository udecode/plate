import { createPluginFactory, isVoid } from '@udecode/plate-common/server';

import type { TabbablePlugin } from './types';

import { TabbableEffects } from './TabbableEffects';
import { KEY_TABBABLE } from './constants';

export const createTabbablePlugin = createPluginFactory<TabbablePlugin>({
  key: KEY_TABBABLE,
  options: {
    globalEventListener: false,
    insertTabbableEntries: () => [],
    isTabbable: (editor, tabbableEntry) =>
      isVoid(editor, tabbableEntry.slateNode),
    query: () => true,
  },
  renderAfterEditable: TabbableEffects,
});
