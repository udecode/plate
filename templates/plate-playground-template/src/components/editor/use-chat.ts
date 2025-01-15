'use client';

import { faker } from '@faker-js/faker';
import { useChat as useBaseChat } from 'ai/react';

import { useSettings } from '@/components/editor/settings';

export const useChat = () => {
  const { keys, model } = useSettings();

  return useBaseChat({
    id: 'editor',
    api: '/api/ai/command',
    body: {
      // !!! DEMO ONLY: don't use API keys client-side
      apiKey: keys.openai,
      model: model.value,
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
  chunkCount = 10,
  streamProtocol = 'data',
}: {
  chunkCount?: number;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  // Create 3 blocks with different lengths
  const blocks = [
    Array.from({ length: chunkCount }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
    Array.from({ length: chunkCount + 2 }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
    Array.from({ length: chunkCount + 4 }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
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
