import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
import type { AIChatPluginConfig } from '../AIChatPlugin';
import { clearMarkdownStreamSession } from '../streaming/markdownStreamSession';

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

  clearMarkdownStreamSession(editor);

  setOptions({
    _replaceIds: [],
    chatNodes: [],
    mode: 'insert',
    toolName: null,
  });

  if (undo) {
    editor.getTransforms(BaseAIPlugin).ai.undo();
  } else {
    editor.getTransforms(BaseAIPlugin).ai.discardPreview();
  }
};
