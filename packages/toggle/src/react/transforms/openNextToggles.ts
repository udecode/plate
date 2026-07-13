import type { PlateEditor } from '@platejs/core/react';
import { type Element, type Value, ElementApi } from '@platejs/plite';

import type { ToggleConfig } from '../TogglePlugin';

// When creating a toggle, we open it by default.
// So before inserting the toggle, we update the store to mark the id of the blocks about to be turned into toggles as open.
export const openNextToggles = (editor: PlateEditor<Value, ToggleConfig>) => {
  const nodeEntries = editor.read.nodes.toArray<Element>({
    match: (node) =>
      ElementApi.isElement(node) && editor.read.nodes.isBlock(node),
    mode: 'lowest',
  });

  editor.api.toggle.toggleIds(
    nodeEntries.flatMap(([node]) =>
      typeof node.id === 'string' ? [node.id] : []
    ),
    true
  );
};
