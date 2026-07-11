import type { SlateEditor } from 'platejs';

import { getTransientSuggestionKey } from '@platejs/suggestion';

import { cancelAIPreview, hasAIPreview } from './aiStreamSnapshot';

export const undoAI = (editor: SlateEditor) => {
  if (hasAIPreview(editor) && cancelAIPreview(editor)) return;

  const hasAINodeOrAISuggestion =
    editor.read.nodes.some({
      at: [],
      match: (n) => !!(n as any).ai,
    }) ||
    editor.read.nodes.some({
      at: [],
      match: (n) => !!n[getTransientSuggestionKey()],
    });

  if ((editor.history.undos.at(-1) as any)?.ai && hasAINodeOrAISuggestion) {
    editor.undo();
    editor.history.redos.pop();

    return;
  }

  if (hasAINodeOrAISuggestion) {
    cancelAIPreview(editor);
  }
};
