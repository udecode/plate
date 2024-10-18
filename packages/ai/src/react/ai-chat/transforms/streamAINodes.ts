import type { Message } from 'ai';
import type { Path } from 'slate';

import { nanoid } from '@udecode/plate-common';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate-common/react';

import type { AIChatPluginConfig } from '../AIChatPlugin';

import {
  type EditorPrompt,
  getEditorPrompt,
} from '../../ai/utils/getEditorPrompt';

export const streamAINodes = async (
  editor: PlateEditor,
  {
    prompt,
    system,
    target = editor.selection?.focus.path,
  }: {
    prompt: EditorPrompt;
    system?: string;
    target?: Path;
  }
) => {
  const { api, getOptions, setOption, setOptions, tf } =
    getEditorPlugin<AIChatPluginConfig>(editor, { key: 'ai' });

  const finalPrompt =
    getEditorPrompt(editor, {
      prompt,
      promptTemplate: getOptions().promptTemplate,
    }) ?? '';

  const newMessages: Message[] = [
    { id: nanoid(), content: finalPrompt, role: 'user' },
  ];

  if (system) {
    newMessages.unshift({ id: nanoid(), content: system, role: 'system' });
  }

  setOptions({
    // isLoading: true,
    // chat: { messages: newMessages },
  });

  // let isFirstInsert = true;

  // const { text } = await api.ai.streamText({
  //   abortController,
  //   fetchStream: editor.getOptions<AIPluginConfig>({ key: 'ai' }).fetchStream!,
  //   prompt: finalPrompt,
  //   system: system ?? PROMPTS.systemDefault,
  //   onChunk: (chunk) => {
  //     if (!target || !getEndPoint(editor, target)) return;

  //     const text = api.ai.stripText(chunk);
  //     tf.ai.insertNodes(text, { isFirst: isFirstInsert, target });
  //     isFirstInsert = false;
  //   },
  //   // onStatusChange: (status) => {
  //   //   setOption('status', status);
  //   // },
  // });

  // if (text.length === 0) {
  //   setOptions({
  //     isLoading: false,
  //     messages: newMessages,
  //   });

  //   return { text: '' };
  // }

  // setOptions({
  //   isLoading: false,
  //   messages: [
  //     ...newMessages,
  //     { id: nanoid(), content: text, role: 'assistant' },
  //   ],
  // });

  // return { text };

  return { text: '' };
};
