import { ElementApi, KEYS, type Point } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import { AI_PREVIEW_KEY } from '../../../lib/transforms/aiStreamSnapshot';
import { withAIBatch } from '../../../lib/transforms/withAIBatch';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';
import { acceptAISuggestions } from '../utils/acceptAISuggestions';

const getAcceptedInsertFocusPoint = (editor: PlateEditor): Point | null => {
  let endIndex: number | null = null;

  editor.children.forEach((node: any, index) => {
    if (ElementApi.isElement(node) && node[AI_PREVIEW_KEY]) {
      endIndex = index;
    }
  });

  if (endIndex === null) return null;

  return editor.api.end([endIndex]) ?? null;
};

export const acceptAIChat = (editor: PlateEditor) => {
  const mode = editor.getOption(AIChatPlugin, 'mode');

  if (mode === 'insert') {
    const ai = editor.getTransforms(BaseAIPlugin).ai;
    const api = editor.getApi<AIChatPluginConfig>({ key: KEYS.ai });
    const focusPoint = getAcceptedInsertFocusPoint(editor);

    if (!ai.acceptPreview()) {
      withAIBatch(editor, () => {
        editor.tf.unsetNodes(AI_PREVIEW_KEY, {
          at: [],
          match: (node) =>
            ElementApi.isElement(node) && !!(node as any)[AI_PREVIEW_KEY],
        });
        ai.removeMarks();
        editor.getTransforms(AIChatPlugin).aiChat.removeAnchor();
      });
    }

    api.aiChat.hide();
    editor.tf.focus();
    if (focusPoint) {
      editor.tf.select({
        anchor: focusPoint,
        focus: focusPoint,
      });
    }
  }

  if (mode === 'chat') {
    withAIBatch(editor, () => {
      acceptAISuggestions(editor);
    });

    editor.getApi(AIChatPlugin).aiChat.hide();
  }
};
