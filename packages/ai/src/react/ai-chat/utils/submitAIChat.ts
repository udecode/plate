import type { ChatRequestOptions } from 'ai';

import { isSelecting } from '@platejs/selection';
import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import { AIPlugin } from '../../ai/AIPlugin';
import { type EditorPrompt, getEditorPrompt } from './getEditorPrompt';

export const submitAIChat = (
  editor: PlateEditor,
  input: string,
  {
    mode,
    options,
    prompt,
    system,
  }: {
    mode?: 'chat' | 'insert';
    options?: ChatRequestOptions;
    prompt?: EditorPrompt;
    system?: EditorPrompt;
  } = {}
) => {
  const { getOptions, setOption } = getEditorPlugin<AIChatPluginConfig>(
    editor,
    {
      key: KEYS.aiChat,
    }
  );

  const { chat, promptTemplate, systemTemplate } = getOptions();

  if (!prompt && input?.length === 0) {
    return;
  }
  if (!prompt) {
    prompt = input;
  }
  if (!mode) {
    mode = isSelecting(editor) ? 'chat' : 'insert';
  }
  if (mode === 'insert') {
    editor.getTransforms(AIPlugin).ai.undo();
  }

  setOption('mode', mode);

  void chat.sendMessage?.(
    {
      text:
        getEditorPrompt(editor, {
          prompt,
          promptTemplate,
        }) ?? '',
    },
    {
      body: {
        system: getEditorPrompt(editor, {
          prompt: system,
          promptTemplate: systemTemplate,
        }),
      },
      ...options,
    }
  );
};
