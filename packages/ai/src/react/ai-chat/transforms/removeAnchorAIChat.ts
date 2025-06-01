import type { PlateEditor } from '@udecode/plate/react';

import { type RemoveNodesOptions, ElementApi, KEYS } from '@udecode/plate';

export const removeAnchorAIChat = (
  editor: PlateEditor,
  options?: RemoveNodesOptions
) => {
  editor.tf.withoutSaving(() => {
    editor.tf.removeNodes({
      at: [],
      match: (n) => ElementApi.isElement(n) && n.type === KEYS.aiChat,
      ...options,
    });
  });
};
