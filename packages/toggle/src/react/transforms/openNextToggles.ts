import type { SlateEditor } from '@udecode/plate';

import { TogglePlugin } from '../TogglePlugin';

// When creating a toggle, we open it by default.
// So before inserting the toggle, we update the store to mark the id of the blocks about to be turned into toggles as open.
export const openNextToggles = (editor: SlateEditor) => {
  const nodeEntries = Array.from(
    editor.api.nodes({
      block: true,
      mode: 'lowest',
    })
  );

  editor.getApi(TogglePlugin).toggle.toggleIds(
    nodeEntries.map(([node]) => node.id as string),
    true
  );
};
