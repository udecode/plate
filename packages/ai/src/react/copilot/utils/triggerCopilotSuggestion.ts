import { KEYS } from '@udecode/plate';
import { type PlateEditor, getEditorPlugin } from '@udecode/plate/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';

import { callCompletionApi } from './callCompletionApi';

export const triggerCopilotSuggestion = async (editor: PlateEditor) => {
  const { api, getOptions, setOption } = getEditorPlugin<CopilotPluginConfig>(
    editor,
    {
      key: KEYS.copilot,
    }
  );

  const { completeOptions, getPrompt, isLoading, triggerQuery } = getOptions();

  if (isLoading || editor.getOptions({ key: KEYS.aiChat }).chat?.isLoading) {
    return false;
  }
  if (!triggerQuery!({ editor })) return false;

  // if (query && !queryEditor(editor, query)) return;

  const prompt = getPrompt!({ editor });

  if (prompt.length === 0) return false;

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
