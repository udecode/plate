'use client';

import { useRef } from 'react';

import { useChat as useBaseChat } from '@ai-sdk/react';
import { faker } from '@faker-js/faker';

import { useSettings } from '@/registry/default/components/editor/settings';

export const useChat = () => {
  const { keys, model } = useSettings();

  // remove when you implement the route /api/ai/command
  const abortControllerRef = useRef<AbortController | null>(null);
  const _abortFakeStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const chat = useBaseChat({
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
        let sample: 'markdown' | 'mdx' | null = null;

        try {
          const content = JSON.parse(init?.body as string).messages.at(
            -1
          ).content;

          if (content.includes('Generate a markdown sample')) {
            sample = 'markdown';
          } else if (content.includes('Generate a mdx sample')) {
            sample = 'mdx';
          }
        } catch {
          sample = null;
        }

        abortControllerRef.current = new AbortController();
        await new Promise((resolve) => setTimeout(resolve, 400));

        const stream = fakeStreamText({
          sample,
          signal: abortControllerRef.current.signal,
        });

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

  return { ...chat, _abortFakeStream };
};

// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 10,
  sample = null,
  signal,
  streamProtocol = 'data',
}: {
  chunkCount?: number;
  sample?: 'markdown' | 'mdx' | null;
  signal?: AbortSignal;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  const blocks = (() => {
    if (sample === 'markdown') {
      return markdownChunks;
    }

    if (sample === 'mdx') {
      return mdxChunks;
    }

    return [
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
  })();

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      if (signal?.aborted) {
        controller.error(new Error('Aborted before start'));
        return;
      }

      const abortHandler = () => {
        controller.error(new Error('Stream aborted'));
      };

      signal?.addEventListener('abort', abortHandler);

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

const mdxChunks = [
  [
    {
      delay: 10,
      texts: '## ',
    },
    {
      delay: 10,
      texts: 'Basic ',
    },
    {
      delay: 10,
      texts: 'Markdown\n\n',
    },
    {
      delay: 10,
      texts: '> ',
    },
    {
      delay: 10,
      texts: 'The ',
    },
    {
      delay: 10,
      texts: 'following ',
    },
    {
      delay: 10,
      texts: 'node ',
    },
    {
      delay: 10,
      texts: 'and ',
    },
    {
      delay: 10,
      texts: 'marks ',
    },
    {
      delay: 10,
      texts: 'is ',
    },
    {
      delay: 10,
      texts: 'supported ',
    },
    {
      delay: 10,
      texts: 'by ',
    },
    {
      delay: 10,
      texts: 'the ',
    },
    {
      delay: 10,
      texts: 'Markdown ',
    },
    {
      delay: 10,
      texts: 'standard.\n\n',
    },
    {
      delay: 10,
      texts: 'Format ',
    },
    {
      delay: 10,
      texts: 'text ',
    },
    {
      delay: 10,
      texts: 'with **b',
    },
    {
      delay: 10,
      texts: 'old**, _',
    },
    {
      delay: 10,
      texts: 'italic_,',
    },
    {
      delay: 10,
      texts: ' _**comb',
    },
    {
      delay: 10,
      texts: 'ined sty',
    },
    {
      delay: 10,
      texts: 'les**_, ',
    },
    {
      delay: 10,
      texts: '~~strike',
    },
    {
      delay: 10,
      texts: 'through~',
    },
    {
      delay: 10,
      texts: '~, `code',
    },
    {
      delay: 10,
      texts: '` format',
    },
    {
      delay: 10,
      texts: 'ting, an',
    },
    {
      delay: 10,
      texts: 'd [hyper',
    },
    {
      delay: 10,
      texts: 'links](https://en.wikipedia.org/wiki/Hypertext).\n\n',
    },
    {
      delay: 10,
      texts: '```javascript\n',
    },
    {
      delay: 10,
      texts: '// Use code blocks to showcase code snippets\n',
    },
    {
      delay: 10,
      texts: 'function greet() {\n',
    },
    {
      delay: 10,
      texts: '  console.info("Hello World!")\n',
    },
    {
      delay: 10,
      texts: '}\n',
    },
    {
      delay: 10,
      texts: '```\n\n',
    },
    {
      delay: 10,
      texts: '- Simple',
    },
    {
      delay: 10,
      texts: ' lists f',
    },
    {
      delay: 10,
      texts: 'or organ',
    },
    {
      delay: 10,
      texts: 'izing co',
    },
    {
      delay: 10,
      texts: 'ntent\n',
    },
    {
      delay: 10,
      texts: '1. ',
    },
    {
      delay: 10,
      texts: 'Numbered ',
    },
    {
      delay: 10,
      texts: 'lists ',
    },
    {
      delay: 10,
      texts: 'for ',
    },
    {
      delay: 10,
      texts: 'sequential ',
    },
    {
      delay: 10,
      texts: 'steps\n\n',
    },
    {
      delay: 10,
      texts: '| **Plugin**  | **Element** | **Inline** | **Void** |\n',
    },
    {
      delay: 10,
      texts: '| ----------- | ----------- | ---------- | -------- |\n',
    },
    {
      delay: 10,
      texts: '| **Heading** |             |            | No       |\n',
    },
    {
      delay: 10,
      texts: '| **Image**   | Yes         | No         | Yes      |\n',
    },
    {
      delay: 10,
      texts: '| **Ment',
    },
    {
      delay: 10,
      texts: 'ion** | Yes         | Yes        | Yes      |\n\n',
    },
    {
      delay: 10,
      texts:
        '![](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
    },
    {
      delay: 10,
      texts: '- [x] Co',
    },
    {
      delay: 10,
      texts: 'mpleted ',
    },
    {
      delay: 10,
      texts: 'tasks\n',
    },
    {
      delay: 10,
      texts: '- [ ] Pe',
    },
    {
      delay: 10,
      texts: 'nding ta',
    },
    {
      delay: 10,
      texts: 'sks\n\n',
    },
    {
      delay: 10,
      texts: '---\n\n## Advan',
    },
    {
      delay: 10,
      texts: 'ced Feat',
    },
    {
      delay: 10,
      texts: 'ures\n\n',
    },
    {
      delay: 10,
      texts: '<callout> ',
    },
    {
      delay: 10,
      texts: 'The ',
    },
    {
      delay: 10,
      texts: 'following ',
    },
    {
      delay: 10,
      texts: 'node ',
    },
    {
      delay: 10,
      texts: 'and ',
    },
    {
      delay: 10,
      texts: 'marks ',
    },
    {
      delay: 10,
      texts: 'are ',
    },
    {
      delay: 10,
      texts: 'not ',
    },
    {
      delay: 10,
      texts: 'supported ',
    },
    {
      delay: 10,
      texts: 'in ',
    },
    {
      delay: 10,
      texts: 'Markdown ',
    },
    {
      delay: 10,
      texts: 'but ',
    },
    {
      delay: 10,
      texts: 'can ',
    },
    {
      delay: 10,
      texts: 'be ',
    },
    {
      delay: 10,
      texts: 'serialized ',
    },
    {
      delay: 10,
      texts: 'and ',
    },
    {
      delay: 10,
      texts: 'deserialized ',
    },
    {
      delay: 10,
      texts: 'using ',
    },
    {
      delay: 10,
      texts: 'MDX ',
    },
    {
      delay: 10,
      texts: 'or ',
    },
    {
      delay: 10,
      texts: 'specialized ',
    },
    {
      delay: 10,
      texts: 'UnifiedJS ',
    },
    {
      delay: 10,
      texts: 'plugins. ',
    },
    {
      delay: 10,
      texts: '</callout>\n\n',
    },
    {
      delay: 10,
      texts: 'Advanced ',
    },
    {
      delay: 10,
      texts: 'marks: ',
    },
    {
      delay: 10,
      texts: '<kbd>⌘ ',
    },
    {
      delay: 10,
      texts: '+ ',
    },
    {
      delay: 10,
      texts: 'B</kbd>,<u>underlined</u>, ',
    },
    {
      delay: 10,
      texts: '<mark',
    },
    {
      delay: 10,
      texts: '>highli',
    },
    {
      delay: 10,
      texts: 'ghted</m',
    },
    {
      delay: 10,
      texts: 'ark',
    },
    {
      delay: 10,
      texts: '> text, ',
    },
    {
      delay: 10,
      texts: '<span s',
    },
    {
      delay: 10,
      texts: 'tyle="co',
    },
    {
      delay: 10,
      texts: 'lor: #93',
    },
    {
      delay: 10,
      texts: 'C47D;">c',
    },
    {
      delay: 10,
      texts: 'olored t',
    },
    {
      delay: 10,
      texts: 'ext</spa',
    },
    {
      delay: 10,
      texts: 'n> and ',
    },
    {
      delay: 10,
      texts: '<spa',
    },
    {
      delay: 10,
      texts: 'n',
    },
    {
      delay: 10,
      texts: ' style="',
    },
    {
      delay: 10,
      texts: 'backgrou',
    },
    {
      delay: 10,
      texts: 'nd-color',
    },
    {
      delay: 10,
      texts: ': #6C9EE',
    },
    {
      delay: 10,
      texts: 'B;">back',
    },
    {
      delay: 10,
      texts: 'ground h',
    },
    {
      delay: 10,
      texts: 'ighlight',
    },
    {
      delay: 10,
      texts: 's</spa',
    },
    {
      delay: 10,
      texts: 'n> for ',
    },
    {
      delay: 10,
      texts: 'visual e',
    },
    {
      delay: 10,
      texts: 'mphasis.\n\n',
    },
    {
      delay: 10,
      texts: 'Superscript ',
    },
    {
      delay: 10,
      texts: 'like ',
    },
    {
      delay: 10,
      texts: 'E=mc<sup>2</sup> ',
    },
    {
      delay: 10,
      texts: 'and ',
    },
    {
      delay: 10,
      texts: 'subscript ',
    },
    {
      delay: 10,
      texts: 'like ',
    },
    {
      delay: 10,
      texts: 'H<sub>2</sub>O ',
    },
    {
      delay: 10,
      texts: 'demonstrate ',
    },
    {
      delay: 10,
      texts: 'mathematical ',
    },
    {
      delay: 10,
      texts: 'and ',
    },
    {
      delay: 10,
      texts: 'chemical ',
    },
    {
      delay: 10,
      texts: 'notation ',
    },
    {
      delay: 10,
      texts: 'capabilities.\n\n',
    },
    {
      delay: 10,
      texts: 'Add ',
    },
    {
      delay: 10,
      texts: 'mentions ',
    },
    {
      delay: 10,
      texts: 'like ',
    },
    {
      delay: 10,
      texts: '@BB-8, d',
    },
    {
      delay: 10,
      texts: 'ates (<d',
    },
    {
      delay: 10,
      texts: 'ate>2025',
    },
    {
      delay: 10,
      texts: '-05-08</',
    },
    {
      delay: 10,
      texts: 'date>), ',
    },
    {
      delay: 10,
      texts: 'and math',
    },
    {
      delay: 10,
      texts: ' formula',
    },
    {
      delay: 10,
      texts: 's ($E=mc',
    },
    {
      delay: 10,
      texts: '^2$).\n\n',
    },
    {
      delay: 10,
      texts: 'The ',
    },
    {
      delay: 10,
      texts: 'table ',
    },
    {
      delay: 10,
      texts: 'of ',
    },
    {
      delay: 10,
      texts: 'contents ',
    },
    {
      delay: 10,
      texts: 'feature ',
    },
    {
      delay: 10,
      texts: 'automatically ',
    },
    {
      delay: 10,
      texts: 'generates ',
    },
    {
      delay: 10,
      texts: 'document ',
    },
    {
      delay: 10,
      texts: 'structure ',
    },
    {
      delay: 10,
      texts: 'for ',
    },
    {
      delay: 10,
      texts: 'easy ',
    },
    {
      delay: 10,
      texts: 'navigation.\n\n',
    },
    {
      delay: 10,
      texts: '<toc ',
    },
    {
      delay: 10,
      texts: '/>\n\n',
    },
    {
      delay: 10,
      texts: 'Math ',
    },
    {
      delay: 10,
      texts: 'formula ',
    },
    {
      delay: 10,
      texts: 'support ',
    },
    {
      delay: 10,
      texts: 'makes ',
    },
    {
      delay: 10,
      texts: 'displaying ',
    },
    {
      delay: 10,
      texts: 'complex ',
    },
    {
      delay: 10,
      texts: 'mathematical ',
    },
    {
      delay: 10,
      texts: 'expressions ',
    },
    {
      delay: 10,
      texts: 'simple.\n\n',
    },
    {
      delay: 10,
      texts: '$$\n',
    },
    {
      delay: 10,
      texts: 'a^2',
    },
    {
      delay: 10,
      texts: '+b^2',
    },
    {
      delay: 10,
      texts: '=c^2\n',
    },
    {
      delay: 10,
      texts: '$$\n\n',
    },
    {
      delay: 10,
      texts: 'Multi-co',
    },
    {
      delay: 10,
      texts: 'lumn lay',
    },
    {
      delay: 10,
      texts: 'out feat',
    },
    {
      delay: 10,
      texts: 'ures ena',
    },
    {
      delay: 10,
      texts: 'ble rich',
    },
    {
      delay: 10,
      texts: 'er page ',
    },
    {
      delay: 10,
      texts: 'designs ',
    },
    {
      delay: 10,
      texts: 'and cont',
    },
    {
      delay: 10,
      texts: 'ent layo',
    },
    {
      delay: 10,
      texts: 'uts.\n\n',
    },
    // {
    //   delay: 10,
    //   texts: '<column_group layout="[50,50]">\n',
    // },
    // {
    //   delay: 10,
    //   texts: '<column width="50%">\n',
    // },
    // {
    //   delay: 10,
    //   texts: '  left\n',
    // },
    // {
    //   delay: 10,
    //   texts: '</column>\n',
    // },
    // {
    //   delay: 10,
    //   texts: '<column width="50%">\n',
    // },
    // {
    //   delay: 10,
    //   texts: '  right\n',
    // },
    // {
    //   delay: 10,
    //   texts: '</column>\n',
    // },
    // {
    //   delay: 10,
    //   texts: '</column_group>\n\n',
    // },
    {
      delay: 10,
      texts: 'PDF ',
    },
    {
      delay: 10,
      texts: 'embedding ',
    },
    {
      delay: 10,
      texts: 'makes ',
    },
    {
      delay: 10,
      texts: 'document ',
    },
    {
      delay: 10,
      texts: 'referencing ',
    },
    {
      delay: 10,
      texts: 'simple ',
    },
    {
      delay: 10,
      texts: 'and ',
    },
    {
      delay: 10,
      texts: 'intuitive.\n\n',
    },
    {
      delay: 10,
      texts: '<file ',
    },
    {
      delay: 10,
      texts: 'name="sample.pdf" ',
    },
    {
      delay: 10,
      texts: 'align="center" ',
    },
    {
      delay: 10,
      texts:
        'src="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf" width="80%" isUpload="true" />\n\n',
    },
    {
      delay: 10,
      texts: 'Audio ',
    },
    {
      delay: 10,
      texts: 'players ',
    },
    {
      delay: 10,
      texts: 'can ',
    },
    {
      delay: 10,
      texts: 'be ',
    },
    {
      delay: 10,
      texts: 'embedded ',
    },
    {
      delay: 10,
      texts: 'directly ',
    },
    {
      delay: 10,
      texts: 'into ',
    },
    {
      delay: 10,
      texts: 'documents, ',
    },
    {
      delay: 10,
      texts: 'supporting ',
    },
    {
      delay: 10,
      texts: 'online ',
    },
    {
      delay: 10,
      texts: 'audio ',
    },
    {
      delay: 10,
      texts: 'resources.\n\n',
    },
    {
      delay: 10,
      texts: '<audio ',
    },
    {
      delay: 10,
      texts: 'align="center" ',
    },
    {
      delay: 10,
      texts:
        'src="https://samplelib.com/lib/preview/mp3/sample-3s.mp3" width="80%" />\n\n',
    },
    {
      delay: 10,
      texts: 'Video ',
    },
    {
      delay: 10,
      texts: 'playback ',
    },
    {
      delay: 10,
      texts: 'features ',
    },
    {
      delay: 10,
      texts: 'support ',
    },
    {
      delay: 10,
      texts: 'embedding ',
    },
    {
      delay: 10,
      texts: 'various ',
    },
    {
      delay: 10,
      texts: 'online ',
    },
    {
      delay: 10,
      texts: 'video ',
    },
    {
      delay: 10,
      texts: 'resources, ',
    },
    {
      delay: 10,
      texts: 'enriching ',
    },
    {
      delay: 10,
      texts: 'document ',
    },
    {
      delay: 10,
      texts: 'content.\n\n',
    },
    {
      delay: 10,
      texts: '<video ',
    },
    {
      delay: 10,
      texts: 'align="center" ',
    },
    {
      delay: 10,
      texts:
        'src="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4" width="80%" isUpload="true" />',
    },
  ],
];
