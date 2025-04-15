import { ElementApi } from '@udecode/plate';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import { withAIBatch } from '../../../lib';
import { AIPlugin } from '../../ai/AIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';

export const acceptAIChat = (editor: PlateEditor) => {
  const { tf } = getEditorPlugin(editor, AIPlugin);

  withAIBatch(editor, () => {
    tf.ai.removeMarks();
    tf.removeNodes({
      at: [],
      match: (n) => ElementApi.isElement(n) && n.type === AIChatPlugin.key,
    });
  });

  editor.getApi<AIChatPluginConfig>({ key: 'ai' }).aiChat.hide();
  editor.tf.focus();
};
