import { type PlateEditor, usePluginOption } from 'platejs/react';

import { AIChatPlugin } from '../AIChatPlugin';

export function getLastAssistantMessage(editor: PlateEditor) {
  const messages = editor.getOptions(AIChatPlugin).chat.messages;

  return messages?.findLast((message) => message.role === 'assistant');
}

export function useLastAssistantMessage() {
  const toolName = usePluginOption(AIChatPlugin, 'toolName');
  const chat = usePluginOption(AIChatPlugin, 'chat');

  if (toolName === 'comment') return;

  return chat.messages?.findLast((message) => message.role === 'assistant');
}
