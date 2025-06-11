import type { PlateEditor } from 'platejs/react';

import { type RemoveNodesOptions, ElementApi, KEYS } from 'platejs';

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
