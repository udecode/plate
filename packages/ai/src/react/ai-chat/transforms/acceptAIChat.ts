import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import { withAIBatch } from '../../../lib';
import { AIPlugin } from '../../ai/AIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';
import { acceptAISuggestions } from '../utils/acceptAISuggestions';

export const acceptAIChat = (editor: PlateEditor) => {
  const mode = editor.getOption(AIChatPlugin, 'mode');

  if (mode === 'insert') {
    const { tf } = getEditorPlugin(editor, AIPlugin);
    const api = editor.getApi<AIChatPluginConfig>({ key: KEYS.ai });

    const lastAINodePath = api.aiChat.node({ at: [], reverse: true })![1];

    withAIBatch(editor, () => {
      tf.ai.removeMarks();
      editor.getTransforms(AIChatPlugin).aiChat.removeAnchor();
    });

    api.aiChat.hide();
    editor.tf.focus();

    const focusPoint = editor.api.end(lastAINodePath)!;

    editor.tf.setSelection({
      anchor: focusPoint,
      focus: focusPoint,
    });
  }

  if (mode === 'chat') {
    withAIBatch(editor, () => {
      acceptAISuggestions(editor);
    });

    editor.getApi(AIChatPlugin).aiChat.hide();
  }
};
