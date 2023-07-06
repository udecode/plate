import { createPluginFactory, isVoid } from '@udecode/plate-common';

import { TabbableEffects } from './TabbableEffects';
import { KEY_TABBABLE } from './constants';
import { TabbablePlugin } from './types';

export const createTabbablePlugin = createPluginFactory<TabbablePlugin>({
  key: KEY_TABBABLE,
  renderAfterEditable: TabbableEffects,
  options: {
    query: () => true,
    globalEventListener: false,
    insertTabbableEntries: () => [],
    isTabbable: (editor, tabbableEntry) =>
      isVoid(editor, tabbableEntry.slateNode),
  },
});
