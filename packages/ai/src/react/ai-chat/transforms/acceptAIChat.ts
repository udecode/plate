import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import { withAIBatch } from '../../../lib';
import { AIPlugin } from '../../ai/AIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';

export const acceptAIChat = (editor: PlateEditor) => {
  const { tf } = getEditorPlugin(editor, AIPlugin);
  const api = editor.getApi<AIChatPluginConfig>({ key: 'ai' });

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
};
