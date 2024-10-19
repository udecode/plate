import { type PlateEditor, getEditorPlugin } from '@udecode/plate-common/react';
import { isSelecting } from '@udecode/plate-selection';

import { type AIChatPluginConfig, AIChatPlugin } from '../AIChatPlugin';
import { type EditorPrompt, getEditorPrompt } from './getEditorPrompt';

export const submitAIChat = (
  editor: PlateEditor,
  {
    mode,
    prompt,
    system,
  }: {
    mode?: 'chat' | 'insert';
    prompt?: EditorPrompt;
    system?: EditorPrompt;
  } = {}
) => {
  const { getOptions, setOption } = getEditorPlugin<AIChatPluginConfig>(
    editor,
    {
      key: 'aiChat',
    }
  );
  const { chat, promptTemplate, systemTemplate } = getOptions();

  if (!prompt && chat.input.length === 0) {
    return;
  }
  if (!prompt) {
    prompt = chat.input;
  }
  if (!mode) {
    mode = isSelecting(editor) ? 'chat' : 'insert';
  }
  if (chat.messages.length > 0) {
    editor.getTransforms(AIChatPlugin).aiChat.undoAI();
  }

  setOption('mode', mode);

  chat.setInput('');

  void chat.append(
    {
      content:
        getEditorPrompt(editor, {
          prompt,
          promptTemplate,
        }) ?? '',
      role: 'user',
    },
    {
      body: {
        system: getEditorPrompt(editor, {
          prompt: system,
          promptTemplate: systemTemplate,
        }),
      },
    }
  );
};
