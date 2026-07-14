import type { PlateEditor } from '@platejs/core/react';

import type { EditorUpdateTransaction, Location } from '@platejs/plite';
import { getPluginType } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export type RemoveAnchorAIChatOptions = { at?: Location };

export const removeAnchorAIChat = (
  editor: PlateEditor,
  tx: EditorUpdateTransaction,
  { at = [] }: RemoveAnchorAIChatOptions = {}
) => {
  tx.nodes.remove({
    at,
    match: { type: getPluginType(editor, KEYS.aiChat) },
  });
};
