import type { PlateEditor } from '@udecode/plate/react';

import { type RemoveNodesOptions, ElementApi } from '@udecode/plate';

import { AIChatPlugin } from '../AIChatPlugin';

export const removeAnchorAIChat = (
  editor: PlateEditor,
  options?: RemoveNodesOptions
) => {
  editor.tf.withoutSaving(() => {
    editor.tf.removeNodes({
      at: [],
      match: (n) => ElementApi.isElement(n) && n.type === AIChatPlugin.key,
      ...options,
    });
  });
};
