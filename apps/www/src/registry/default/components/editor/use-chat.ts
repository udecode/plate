'use client';

import { useChat as useBaseChat } from '@ai-sdk/react';
import { faker } from '@faker-js/faker';

import { useSettings } from '@/registry/default/components/editor/settings';

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
    // Mock the API response. Remove it when you implement the route /api/ai/command
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
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Make text ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '**bold**' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ', ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '*italic*' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ', ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '__underlined__' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ', or apply a ' },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts: '***combination***',
    },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ' ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'of ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'these ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'styles ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'for ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'a ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'visually ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'striking ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'effect.' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Add ' },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts: '~~strikethrough~~',
    },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ' ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'to ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'indicate ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'deleted ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'or ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'outdated ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'content.' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Write ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'code ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'snippets ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'with ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'inline ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '`code`' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ' formatting ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'for ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'easy ' },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: 'readability.' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Add ' },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts: '[links](https://example.com)',
    },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: ' to ' },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: 'external ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'resources ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'or ' },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts: 'references.\n\n',
    },

    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Use ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'inline ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'math ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'equations ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'like ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '$E = mc^2$ ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'for ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'scientific ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'notation.' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '\n\n' },

    { delay: faker.number.int({ max: 20, min: 5 }), texts: '# ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Heading ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '1\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '## ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Heading ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '2\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '### ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Heading ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '3\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '> ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Blockquote\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '- ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Unordered ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'list ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'item ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '1\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '- ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Unordered ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'list ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'item ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '2\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '1. ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Ordered ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'list ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'item ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '1\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '2. ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Ordered ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'list ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'item ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '2\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '- ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '[ ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '] ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Task ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'list ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'item ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '1\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '- ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '[x] ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Task ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'list ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'item ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '2\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '![Alt ' },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts:
        'text](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
    },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts: '### Advantage blocks:\n',
    },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '$$\n' },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts: 'a^2 + b^2 = c^2\n',
    },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '$$\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '```python\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '# ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Code ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'block\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'print("Hello, ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'World!")\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '```\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Horizontal ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'rule\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '---\n\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '| ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Header ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '1 ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '| ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Header ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '2 ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '|\n' },
    {
      delay: faker.number.int({ max: 20, min: 5 }),
      texts: '|----------|----------|\n',
    },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '| ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Row ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '1   ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ' | ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Data    ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ' |\n' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '| ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Row ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: '2   ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ' | ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: 'Data    ' },
    { delay: faker.number.int({ max: 20, min: 5 }), texts: ' |' },
  ],
];
