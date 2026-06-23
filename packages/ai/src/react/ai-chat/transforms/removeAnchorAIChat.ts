import type { PlateEditor } from 'platejs/react';

import {
  ElementApi,
  type EditorUpdateTransaction,
  getPluginType,
  KEYS,
} from 'platejs';

export type RemoveAnchorAIChatOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['remove']>[0]
>;

export const removeAnchorAIChat = (
  editor: PlateEditor,
  options?: RemoveAnchorAIChatOptions
) => {
  editor.api.history.withoutSaving(() => {
    editor.update((tx) => {
      tx.nodes.remove({
        at: [],
        match: (n) =>
          ElementApi.isElement(n) &&
          n.type === getPluginType(editor, KEYS.aiChat),
        ...options,
      });
    });
  });
};
