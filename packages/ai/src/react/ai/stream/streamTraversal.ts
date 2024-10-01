'use client';

import type { PlateEditor } from '@udecode/plate-core/react';

import { AIPlugin } from '../AIPlugin';

interface StreamTraversalOptions {
  prompt: string;
  system: string;
}

export const streamTraversal = async (
  editor: PlateEditor,
  fn: (delta: string, done: boolean) => void,
  { prompt, system }: StreamTraversalOptions
) => {
  const abortController = new AbortController();
  editor.setOptions(AIPlugin, { abortController });

  const fetchSuggestion = editor.getOptions(AIPlugin).fetchSuggestion!;

  const response = await fetchSuggestion({
    abortSignal: abortController,
    prompt,
    system,
  });

  const reader = response.getReader();
  const decoder = new TextDecoder();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      fn('\n', done);

      break;
    }
    if (value) {
      const delta = decoder.decode(value);

      fn(delta, done);
    }
  }
};
