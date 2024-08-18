import { type SlateEditor, getNodeEntries } from '@udecode/plate-common';

import { toggleIds } from '../toggle-controller-store';

// When creating a toggle, we open it by default.
// So before inserting the toggle, we update the store to mark the id of the blocks about to be turned into toggles as open.
export const openNextToggles = (editor: SlateEditor) => {
  const nodeEntries = Array.from(
    getNodeEntries(editor, {
      block: true,
      mode: 'lowest',
    })
  );

  toggleIds(
    editor,
    nodeEntries.map(([node]) => node.id as string),
    true
  );
};
