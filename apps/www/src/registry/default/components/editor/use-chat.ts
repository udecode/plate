'use client';

import { faker } from '@faker-js/faker';
import { useChat as useBaseChat } from 'ai/react';

import { useSettings } from '@/registry/default/components/editor/settings';

export const useChat = () => {
  const { keys, model } = useSettings();

  return useBaseChat({
    id: 'editor',
    api: '/api/ai/command1',
    body: {
      // !!! DEMO ONLY: don't use API keys client-side
      apiKey: keys.openai,
      model: model.value,
    },
    fetch: async (input, init) => {
      const res = await fetch(input, init);

      if (!res.ok) {
        let isMarkdown = false;

        try {
          isMarkdown = JSON.parse(init?.body as string)
            .messages.at(-1)
            .content.includes('Generate a markdown sample');
        } catch {
          isMarkdown = false;
        }

        // Mock the API response. Remove it when you implement the route /api/ai/command
        await new Promise((resolve) => setTimeout(resolve, 400));

        const stream = fakeStreamText({ isMarkdown });

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
  isMarkdown = false,
  streamProtocol = 'data',
}: {
  chunkCount?: number;
  isMarkdown?: boolean;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  // Create 3 blocks with different lengths
  const blocks = isMarkdown
    ? markdownChunks
    : [
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

const markdownChunks = [
  [
    { delay: 100, texts: '# ' },
    { delay: 100, texts: 'Heading ' },
    { delay: 100, texts: '1\n\n' },
    { delay: 100, texts: '## ' },
    { delay: 100, texts: 'Heading ' },
    { delay: 100, texts: '2\n\n' },
    { delay: 100, texts: '### ' },
    { delay: 100, texts: 'Heading ' },
    { delay: 100, texts: '3\n\n' },
    { delay: 100, texts: '**Bold ' },
    { delay: 100, texts: 'Text**\n\n' },
    { delay: 100, texts: '*Italic ' },
    { delay: 100, texts: 'Text*\n\n' },
    { delay: 100, texts: '~~Strikethrough~~\n\n' },
    { delay: 100, texts: '> ' },
    { delay: 100, texts: 'Blockquote\n\n' },
    { delay: 100, texts: '- ' },
    { delay: 100, texts: 'Unordered ' },
    { delay: 100, texts: 'list ' },
    { delay: 100, texts: 'item ' },
    { delay: 100, texts: '1\n' },
    { delay: 100, texts: '- ' },
    { delay: 100, texts: 'Unordered ' },
    { delay: 100, texts: 'list ' },
    { delay: 100, texts: 'item ' },
    { delay: 100, texts: '2\n\n' },
    { delay: 100, texts: '1. ' },
    { delay: 100, texts: 'Ordered ' },
    { delay: 100, texts: 'list ' },
    { delay: 100, texts: 'item ' },
    { delay: 100, texts: '1\n' },
    { delay: 100, texts: '2. ' },
    { delay: 100, texts: 'Ordered ' },
    { delay: 100, texts: 'list ' },
    { delay: 100, texts: 'item ' },
    { delay: 100, texts: '2\n\n' },
    {
      delay: 100,
      texts:
        'To display an inline equation, you can use single dollar signs: $E = mc^2$.\n',
    },
    { delay: 100, texts: '\n' },
    { delay: 100, texts: 'For a block equation, use double dollar signs:\n' },
    { delay: 100, texts: '\n' },
    { delay: 100, texts: '$$\n' },
    { delay: 100, texts: 'a^2 + b^2 = c^2\n' },
    { delay: 100, texts: '$$\n' },
    { delay: 100, texts: '\n' },
    { delay: 100, texts: '`Inline ' },
    { delay: 100, texts: 'code`\n\n' },
    { delay: 100, texts: '```python\n' },
    { delay: 100, texts: '# ' },
    { delay: 100, texts: 'Code ' },
    { delay: 100, texts: 'block\n' },
    { delay: 100, texts: 'print("Hello, ' },
    { delay: 100, texts: 'World!")\n' },
    { delay: 100, texts: '```\n\n' },
    { delay: 100, texts: '[Link ' },
    { delay: 100, texts: 'text](https://example.com)\n\n' },
    { delay: 100, texts: '![Alt ' },
    {
      delay: 100,
      texts:
        'text](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
    },
    { delay: 100, texts: '---\n\n' },
    { delay: 100, texts: 'Horizontal ' },
    { delay: 100, texts: 'rule\n\n' },
    { delay: 100, texts: '| ' },
    { delay: 100, texts: 'Header ' },
    { delay: 100, texts: '1 ' },
    { delay: 100, texts: '| ' },
    { delay: 100, texts: 'Header ' },
    { delay: 100, texts: '2 ' },
    { delay: 100, texts: '|\n' },
    { delay: 100, texts: '|----------|----------|\n' },
    { delay: 100, texts: '| ' },
    { delay: 100, texts: 'Row ' },
    { delay: 100, texts: '1   ' },
    { delay: 100, texts: ' | ' },
    { delay: 100, texts: 'Data    ' },
    { delay: 100, texts: ' |\n' },
    { delay: 100, texts: '| ' },
    { delay: 100, texts: 'Row ' },
    { delay: 100, texts: '2   ' },
    { delay: 100, texts: ' | ' },
    { delay: 100, texts: 'Data    ' },
    { delay: 100, texts: ' |\n\n' },
    { delay: 100, texts: '- ' },
    { delay: 100, texts: '[ ' },
    { delay: 100, texts: '] ' },
    { delay: 100, texts: 'Task ' },
    { delay: 100, texts: 'list ' },
    { delay: 100, texts: 'item ' },
    { delay: 100, texts: '1\n' },
    { delay: 100, texts: '- ' },
    { delay: 100, texts: '[x] ' },
    { delay: 100, texts: 'Task ' },
    { delay: 100, texts: 'list ' },
    { delay: 100, texts: 'item ' },
    { delay: 100, texts: '2' },
  ],
];
