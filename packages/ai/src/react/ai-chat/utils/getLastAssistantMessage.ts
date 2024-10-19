import { type PlateEditor, useEditorRef } from '@udecode/plate-common/react';

import { AIChatPlugin } from '../AIChatPlugin';

export function getLastAssistantMessage(editor: PlateEditor) {
  const messages = editor.getOptions(AIChatPlugin).chat.messages;

  return messages?.findLast((message) => message.role === 'assistant');
}

export function useLastAssistantMessage() {
  const editor = useEditorRef();

  const chat = editor.useOption(AIChatPlugin, 'chat');

  return chat.messages.findLast((message) => message.role === 'assistant');
}
