import { type PlateEditor, usePluginOption } from '@udecode/plate/react';

import { AIChatPlugin } from '../AIChatPlugin';

export function getLastAssistantMessage(editor: PlateEditor) {
  const messages = editor.getOptions(AIChatPlugin).chat.messages;

  return messages?.findLast((message) => message.role === 'assistant');
}

export function useLastAssistantMessage() {
  const chat = usePluginOption(AIChatPlugin, 'chat');

  return chat.messages?.findLast((message) => message.role === 'assistant');
}
