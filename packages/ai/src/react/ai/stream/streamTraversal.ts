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

  const response = await fetch('/api/ai/command', {
    body: JSON.stringify({ prompt, system }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal: abortController.signal,
  }).catch((error) => {
    console.error(error);
  });

  if (response?.status === 429) {
    return fn(
      'Rate limit exceeded. You have made too many requests. Please try again later.',
      true
    );
  }
  if (!response || !response.body) {
    throw new Error('Response or response body is null or abort');
  }

  const reader = response.body.getReader();
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
