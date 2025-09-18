import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { AIPlugin } from '../../ai/AIPlugin';

export const resetAIChat = (editor: PlateEditor) => {
  const { api, getOptions, setOptions } = getEditorPlugin<AIChatPluginConfig>(
    editor,
    {
      key: KEYS.aiChat,
    }
  );

  api.aiChat.stop();

  const chat = getOptions().chat;

  if (chat.messages && chat.messages.length > 0) {
    chat.setMessages?.([]);
  }

  setOptions({
    _replaceIds: [],
    chatNodes: [],
    mode: 'insert',
    toolName: 'generate',
  });

  editor.getTransforms(AIPlugin).ai.undo();
};
