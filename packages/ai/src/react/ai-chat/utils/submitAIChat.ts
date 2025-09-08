import type { ChatRequestOptions } from 'ai';

import { isSelecting } from '@platejs/selection';
import { KEYS } from 'platejs';
import { type PlateEditor, getEditorPlugin } from 'platejs/react';

import type { AIChatPluginConfig, AIMode, AIToolName } from '../AIChatPlugin';

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
    toolName,
  }: {
    mode?: AIMode;
    options?: ChatRequestOptions;
    prompt?: EditorPrompt;
    system?: EditorPrompt;
    toolName?: AIToolName;
  } = {}
) => {
  const { getOptions, setOption } = getEditorPlugin<AIChatPluginConfig>(
    editor,
    {
      key: KEYS.aiChat,
    }
  );

  const { chat, commentPromptTemplate, promptTemplate, systemTemplate } =
    getOptions();

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

  setOption('toolName', toolName ?? null);

  const commentPrompt =
    !toolName || toolName === 'comment'
      ? getEditorPrompt(editor, {
          promptTemplate: commentPromptTemplate,
        })
      : undefined;

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
        commentPrompt,
        system: getEditorPrompt(editor, {
          prompt: system,
          promptTemplate: systemTemplate,
        }),
        toolName,
      },
      ...options,
    }
  );
};
