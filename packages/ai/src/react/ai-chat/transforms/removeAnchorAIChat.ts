import type { PlateEditor } from 'platejs/react';

import { type RemoveNodesOptions, getPluginType, KEYS } from 'platejs';

export const removeAnchorAIChat = (
  editor: PlateEditor,
  options?: RemoveNodesOptions
) => {
  editor.tf.withoutSaving(() => {
    editor.tf.removeNodes({
      at: [],
      match: { type: getPluginType(editor, KEYS.aiChat) },
      ...options,
    });
  });
};
