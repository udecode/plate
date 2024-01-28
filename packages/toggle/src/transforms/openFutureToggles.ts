import {
  getNodeEntries,
  PlateEditor,
  withoutNormalizing,
} from '@udecode/plate-common';

import { toggleToggleId } from '../store';
import { ToggleEditor } from '../types';

// When creating a toggle, we open it by default.
// So before inserting the toggle, we update the store to mark the id of the blocks about to be turned into toggles as open.
export const openFutureToggles = (editor: PlateEditor & ToggleEditor) => {
  const nodeEntries = Array.from(
    getNodeEntries(editor, {
      block: true,
      mode: 'lowest',
    })
  );

  withoutNormalizing(editor, () => {
    nodeEntries.forEach(([node]) => {
      editor.toggleStore.set.openIds(
        toggleToggleId({
          openIds: editor.toggleStore.get.openIds(),
          open: false,
          toggleId: node.id as string,
        })
      );
    });
  });
};
