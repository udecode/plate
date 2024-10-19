import { type PlateEditor, getEditorPlugin } from '@udecode/plate-common/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { AIPlugin } from '../../ai/AIPlugin';

export const resetAIChat = (editor: PlateEditor) => {
  const { api, getOptions } = getEditorPlugin<AIChatPluginConfig>(editor, {
    key: 'aiChat',
  });

  api.aiChat.stop();

  const chat = getOptions().chat;

  if (chat.messages.length > 0) {
    chat.setMessages([]);
  }

  editor.getTransforms(AIPlugin).ai.removeNodes();
};
