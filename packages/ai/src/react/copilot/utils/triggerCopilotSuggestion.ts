import { type PlateEditor, getEditorPlugin } from '@udecode/plate-common/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';

import { AIChatPlugin } from '../../ai-chat/AIChatPlugin';
import { callCompletionApi } from './callCompletionApi';

export const triggerCopilotSuggestion = async (editor: PlateEditor) => {
  const { api, getOptions, setOption } = getEditorPlugin<CopilotPluginConfig>(
    editor,
    {
      key: 'copilot',
    }
  );

  const { completeOptions, getPrompt, isLoading, triggerQuery } = getOptions();

  if (isLoading || editor.getOptions(AIChatPlugin).chat?.isLoading) return;
  if (!triggerQuery!({ editor })) return;

  // if (query && !queryEditor(editor, query)) return;

  const prompt = getPrompt!({ editor });

  if (prompt.length === 0) return;

  api.copilot.stop();

  await callCompletionApi({
    prompt,
    onFinish: (_, completion) => {
      api.copilot.setBlockSuggestion({ text: completion });
    },
    ...completeOptions,
    setAbortController: (controller) =>
      setOption('abortController', controller),
    setCompletion: (completion) => setOption('completion', completion),
    setError: (error) => setOption('error', error),
    setLoading: (loading) => setOption('isLoading', loading),
    onError: (error) => {
      setOption('error', error);
      completeOptions?.onError?.(error);
    },
  });
};
