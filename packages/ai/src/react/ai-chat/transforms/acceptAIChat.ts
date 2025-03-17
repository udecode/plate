import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { withAIBatch } from '../../../lib';
import { AIPlugin } from '../../ai/AIPlugin';

export const acceptAIChat = (editor: PlateEditor) => {
  const { tf } = getEditorPlugin(editor, AIPlugin);

  withAIBatch(editor, () => {
    tf.ai.removeMarks();
  });

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();
  editor.tf.focus();
};
