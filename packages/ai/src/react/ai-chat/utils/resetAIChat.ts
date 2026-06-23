import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import { discardAIPreview, undoAI } from '../../../lib/transforms';
import type { AIChatPluginConfig } from '../AIChatPlugin';

export const resetAIChat = (
  editor: PlateEditor,
  { undo = true }: { undo?: boolean } = {}
) => {
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
    toolName: null,
  });

  if (undo) {
    undoAI(editor);
  } else {
    discardAIPreview(editor);
  }
};
