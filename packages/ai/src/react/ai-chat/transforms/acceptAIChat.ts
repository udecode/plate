import { ElementApi, type Point, type Value } from 'platejs';

import {
  AI_PREVIEW_KEY,
  acceptAIPreview,
} from '../../../lib/transforms/aiStreamSnapshot';
import { removeAIMarks } from '../../../lib/transforms/removeAIMarks';
import { withAIBatch } from '../../../lib/transforms/withAIBatch';
import { AIChatPlugin } from '../AIChatPlugin';
import type { AIChatPlateEditor } from '../internal/editorTypes';
import { acceptAISuggestions } from '../utils/acceptAISuggestions';
import { removeAnchorAIChat } from './removeAnchorAIChat';

const getAcceptedInsertFocusPoint = (
  editor: AIChatPlateEditor
): Point | null => {
  let endIndex: number | null = null;

  editor.children.forEach((node: Value[number], index) => {
    if (
      ElementApi.isElement(node) &&
      Boolean((node as Value[number] & Record<string, unknown>)[AI_PREVIEW_KEY])
    ) {
      endIndex = index;
    }
  });

  if (endIndex === null) return null;

  return editor.api.end([endIndex]) ?? null;
};

export const acceptAIChat = (editor: AIChatPlateEditor) => {
  const mode = editor.getOption(AIChatPlugin, 'mode');

  if (mode === 'insert') {
    const api = editor.api;
    const focusPoint = getAcceptedInsertFocusPoint(editor);

    if (!acceptAIPreview(editor)) {
      withAIBatch(editor, () => {
        editor.update((tx) => {
          tx.nodes.unset(AI_PREVIEW_KEY, {
            at: [],
            match: (node) =>
              ElementApi.isElement(node) &&
              Boolean((node as Record<string, unknown>)[AI_PREVIEW_KEY]),
          });
        });
        removeAIMarks(editor);
        removeAnchorAIChat(editor);
      });
    }

    api.aiChat.hide();
    editor.api.dom.focus();
    if (focusPoint) {
      editor.update((tx) => {
        tx.selection.set({
          anchor: focusPoint,
          focus: focusPoint,
        });
      });
    }
  }

  if (mode === 'chat') {
    withAIBatch(editor, () => {
      acceptAISuggestions(editor);
    });

    editor.api.aiChat.hide();
  }
};
