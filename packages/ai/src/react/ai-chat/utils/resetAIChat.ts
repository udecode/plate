import { KEYS } from '@platejs/utils';
import { type PlateEditor, getEditorPlugin } from '@platejs/core/react';

import { BaseAIPlugin } from '../../../lib/BaseAIPlugin';
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

  api.stop();

  const chat = getOptions().chat;

  if (chat?.messages && chat.messages.length > 0) {
    chat.clear();
  }

  setOptions({
    _replaceIds: [],
    chatNodes: [],
    mode: 'insert',
    toolName: null,
  });

  if (undo) {
    editor.plugin(BaseAIPlugin).api.undo();
  } else {
    editor.plugin(BaseAIPlugin).api.discardPreview();
  }
};
