'use client';

import { openai } from '@ai-sdk/openai';
import { useChat as useBaseChat } from 'ai/react';

import { useSettings } from '@/registry/default/components/editor/settings';

export const useChat = () => {
  const { keys, model } = useSettings();

  return useBaseChat({
    id: 'editor',
    api: '/api/ai/command',
    body: {
      // !!! DEMO ONLY: don't use API keys client-side
      apiKey: keys.openai,
      model: openai('gpt-4o'),
    },
    fetch: async (input, init) => {
      const res = await fetch(input, init);

      if (!res.ok) {
        // Mock the API response. Remove it when you implement the route /api/ai/command
        await new Promise((resolve) => setTimeout(resolve, 400));

        const stream = fakeStreamText();

        return new Response(stream, {
          headers: {
            Connection: 'keep-alive',
            'Content-Type': 'text/plain',
          },
        });
      }

      return res;
    },
  });
};

// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 3,
  streamProtocol = 'data',
}: {
  chunkCount?: number;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  // Create 3 blocks with different lengths
  const blocks = [
    [
      { delay: 100, texts: 'Here is an example of Markdown with math:\n' },
      { delay: 100, texts: '\n' },
      {
        delay: 100,
        texts:
          'To display an inline equation, you can use single dollar signs: $E = mc^3$.\n',
      },
      { delay: 100, texts: '\n' },
      { delay: 100, texts: 'For a block equation, use double dollar signs:\n' },
      { delay: 100, texts: '\n' },
      { delay: 100, texts: '$$\n' },
      { delay: 100, texts: 'a^2 + b^2 = c^2\n' },
      { delay: 100, texts: '$$\n' },
      { delay: 100, texts: '\n' },
      {
        delay: 100,
        texts:
          'These examples show how to include mathematical expressions in Markdown.',
      },
    ],
  ];
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        // Stream the block content
        for (const chunk of block) {
          await new Promise((resolve) => setTimeout(resolve, chunk.delay));

          if (streamProtocol === 'text') {
            controller.enqueue(encoder.encode(chunk.texts));
          } else {
            controller.enqueue(
              encoder.encode(`0:${JSON.stringify(chunk.texts)}\n`)
            );
          }
        }

        // Add double newline after each block except the last one
        if (i < blocks.length - 1) {
          if (streamProtocol === 'text') {
            controller.enqueue(encoder.encode('\n\n'));
          } else {
            controller.enqueue(encoder.encode(`0:${JSON.stringify('\n\n')}\n`));
          }
        }
      }

      if (streamProtocol === 'data') {
        controller.enqueue(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${blocks.reduce(
            (sum, block) => sum + block.length,
            0
          )}}}\n`
        );
      }

      controller.close();
    },
  });
};
