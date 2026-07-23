import { KEYS } from '@platejs/utils';
import type { MarkdownEditor } from '@platejs/markdown';
import type { PlateEditor } from '@platejs/core/react';

import type { CopilotPluginConfig } from '../CopilotPlugin';

import { callCompletionApi } from './callCompletionApi';

const isHeaderTupleList = (
  value: unknown
): value is readonly (readonly [string, string])[] => Array.isArray(value);

export const triggerCopilotSuggestion = async (
  editor: MarkdownEditor<PlateEditor>
) => {
  const { api, getOptions, setOption } = editor.plugin<CopilotPluginConfig>({
    key: KEYS.copilot,
  });

  const { completeOptions, getPrompt, isLoading, triggerQuery } = getOptions();
  const headers = completeOptions?.headers;
  const chatStatus = editor.plugin({ key: KEYS.aiChat }).getOptions()
    .chat?.status;

  if (isLoading || chatStatus === 'submitted' || chatStatus === 'streaming') {
    return false;
  }
  if (!triggerQuery?.({ editor })) return false;

  // if (query && !queryEditor(editor, query)) return;

  const prompt = getPrompt?.({ editor });

  if (!prompt) return false;

  api.stop();

  await callCompletionApi({
    prompt,
    onFinish: (_, completion) => {
      api.setBlockSuggestion({ text: completion });
    },
    ...completeOptions,
    headers:
      headers instanceof Headers
        ? Object.fromEntries(headers.entries())
        : isHeaderTupleList(headers)
          ? Object.fromEntries(headers)
          : headers
            ? { ...headers }
            : undefined,
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
