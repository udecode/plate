import { type Point, ElementApi } from '@platejs/plite';
import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import type { PlateEditor } from '@platejs/core/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import { AI_PREVIEW_KEY } from '../../../lib/transforms/aiStreamSnapshot';
import { removeAIMarks } from '../../../lib/transforms/removeAIMarks';
import { withAIBatch } from '../../../lib/transforms/withAIBatch';
import type { AIChatPluginConfig } from '../AIChatPlugin';
import { acceptAISuggestions } from '../utils/acceptAISuggestions';
import { removeAnchorAIChat } from './removeAnchorAIChat';

const getAcceptedInsertFocusPoint = (editor: PlateEditor): Point | null => {
  let endIndex: number | null = null;

  editor.read.children().forEach((node, index) => {
    if (ElementApi.isElement(node) && node[AI_PREVIEW_KEY]) {
      endIndex = index;
    }
  });

  if (endIndex === null) return null;

  return editor.read.points.end([endIndex]) ?? null;
};

export const acceptAIChat = (editor: PlateEditor) => {
  const aiChat = getEditorPlugin<AIChatPluginConfig>(editor, {
    key: KEYS.aiChat,
  });
  const mode = aiChat.getOption('mode');

  if (mode === 'insert') {
    const ai = editor.plugin(BaseAIPlugin).api;
    const focusPoint = getAcceptedInsertFocusPoint(editor);

    if (!ai.acceptPreview()) {
      withAIBatch(editor, (tx) => {
        tx.nodes.unset(AI_PREVIEW_KEY, {
          at: [],
          match: (node) => ElementApi.isElement(node) && !!node[AI_PREVIEW_KEY],
        });
        removeAIMarks(editor, tx);
        removeAnchorAIChat(editor, tx);
      });
    }

    aiChat.api.hide();
    editor.api.dom.focus();
    if (focusPoint) {
      editor.update.selection.set({
        anchor: focusPoint,
        focus: focusPoint,
      });
    }
  }

  if (mode === 'chat') {
    acceptAISuggestions(editor);

    aiChat.api.hide();
  }
};
