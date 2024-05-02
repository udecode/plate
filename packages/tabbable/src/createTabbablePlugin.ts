import { createPluginFactory, isVoid } from '@udecode/plate-common/server';

import { KEY_TABBABLE } from './constants';
import { TabbableEffects } from './TabbableEffects';
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
