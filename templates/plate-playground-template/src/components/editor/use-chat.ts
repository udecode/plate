'use client';

import * as React from 'react';

import { useChat as useBaseChat } from '@ai-sdk/react';
import { faker } from '@faker-js/faker';

import { useSettings } from '@/components/editor/settings';

export const useChat = () => {
  const { keys, model } = useSettings();

  // remove when you implement the route /api/ai/command
  const abortControllerRef = React.useRef<AbortController | null>(null);
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

const delay = faker.number.int({ max: 20, min: 5 });

const markdownChunks = [
  [
    { delay, texts: 'Make text ' },
    { delay, texts: '**bold**' },
    { delay, texts: ', ' },
    { delay, texts: '*italic*' },
    { delay, texts: ', ' },
    { delay, texts: '__underlined__' },
    { delay, texts: ', or apply a ' },
    {
      delay,
      texts: '***combination***',
    },
    { delay, texts: ' ' },
    { delay, texts: 'of ' },
    { delay, texts: 'these ' },
    { delay, texts: 'styles ' },
    { delay, texts: 'for ' },
    { delay, texts: 'a ' },
    { delay, texts: 'visually ' },
    { delay, texts: 'striking ' },
    { delay, texts: 'effect.' },
    { delay, texts: '\n\n' },
    { delay, texts: 'Add ' },
    {
      delay,
      texts: '~~strikethrough~~',
    },
    { delay, texts: ' ' },
    { delay, texts: 'to ' },
    { delay, texts: 'indicate ' },
    { delay, texts: 'deleted ' },
    { delay, texts: 'or ' },
    { delay, texts: 'outdated ' },
    { delay, texts: 'content.' },
    { delay, texts: '\n\n' },
    { delay, texts: 'Write ' },
    { delay, texts: 'code ' },
    { delay, texts: 'snippets ' },
    { delay, texts: 'with ' },
    { delay, texts: 'inline ' },
    { delay, texts: '`code`' },
    { delay, texts: ' formatting ' },
    { delay, texts: 'for ' },
    { delay, texts: 'easy ' },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: 'readability.' },
    { delay, texts: '\n\n' },
    { delay, texts: 'Add ' },
    {
      delay,
      texts: '[links](https://example.com)',
    },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: ' to ' },
    { delay: faker.number.int({ max: 100, min: 30 }), texts: 'external ' },
    { delay, texts: 'resources ' },
    { delay, texts: 'or ' },
    {
      delay,
      texts: 'references.\n\n',
    },

    { delay, texts: 'Use ' },
    { delay, texts: 'inline ' },
    { delay, texts: 'math ' },
    { delay, texts: 'equations ' },
    { delay, texts: 'like ' },
    { delay, texts: '$E = mc^2$ ' },
    { delay, texts: 'for ' },
    { delay, texts: 'scientific ' },
    { delay, texts: 'notation.' },
    { delay, texts: '\n\n' },

    { delay, texts: '# ' },
    { delay, texts: 'Heading ' },
    { delay, texts: '1\n\n' },
    { delay, texts: '## ' },
    { delay, texts: 'Heading ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '### ' },
    { delay, texts: 'Heading ' },
    { delay, texts: '3\n\n' },
    { delay, texts: '> ' },
    { delay, texts: 'Blockquote\n\n' },
    { delay, texts: '- ' },
    { delay, texts: 'Unordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '1\n' },
    { delay, texts: '- ' },
    { delay, texts: 'Unordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '1. ' },
    { delay, texts: 'Ordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '1\n' },
    { delay, texts: '2. ' },
    { delay, texts: 'Ordered ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '- ' },
    { delay, texts: '[ ' },
    { delay, texts: '] ' },
    { delay, texts: 'Task ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '1\n' },
    { delay, texts: '- ' },
    { delay, texts: '[x] ' },
    { delay, texts: 'Task ' },
    { delay, texts: 'list ' },
    { delay, texts: 'item ' },
    { delay, texts: '2\n\n' },
    { delay, texts: '![Alt ' },
    {
      delay,
      texts:
        'text](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
    },
    {
      delay,
      texts: '### Advantage blocks:\n',
    },
    { delay, texts: '\n' },
    { delay, texts: '$$\n' },
    {
      delay,
      texts: 'a^2 + b^2 = c^2\n',
    },
    { delay, texts: '$$\n' },
    { delay, texts: '\n' },
    { delay, texts: '```python\n' },
    { delay, texts: '# ' },
    { delay, texts: 'Code ' },
    { delay, texts: 'block\n' },
    { delay, texts: 'print("Hello, ' },
    { delay, texts: 'World!")\n' },
    { delay, texts: '```\n\n' },
    { delay, texts: 'Horizontal ' },
    { delay, texts: 'rule\n\n' },
    { delay, texts: '---\n\n' },
    { delay, texts: '| ' },
    { delay, texts: 'Header ' },
    { delay, texts: '1 ' },
    { delay, texts: '| ' },
    { delay, texts: 'Header ' },
    { delay, texts: '2 ' },
    { delay, texts: '|\n' },
    {
      delay,
      texts: '|----------|----------|\n',
    },
    { delay, texts: '| ' },
    { delay, texts: 'Row ' },
    { delay, texts: '1   ' },
    { delay, texts: ' | ' },
    { delay, texts: 'Data    ' },
    { delay, texts: ' |\n' },
    { delay, texts: '| ' },
    { delay, texts: 'Row ' },
    { delay, texts: '2   ' },
    { delay, texts: ' | ' },
    { delay, texts: 'Data    ' },
    { delay, texts: ' |' },
  ],
];

const mdxChunks = [
  [
    {
      delay,
      texts: '## ',
    },
    {
      delay,
      texts: 'Basic ',
    },
    {
      delay,
      texts: 'Markdown\n\n',
    },
    {
      delay,
      texts: '> ',
    },
    {
      delay,
      texts: 'The ',
    },
    {
      delay,
      texts: 'following ',
    },
    {
      delay,
      texts: 'node ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'marks ',
    },
    {
      delay,
      texts: 'is ',
    },
    {
      delay,
      texts: 'supported ',
    },
    {
      delay,
      texts: 'by ',
    },
    {
      delay,
      texts: 'the ',
    },
    {
      delay,
      texts: 'Markdown ',
    },
    {
      delay,
      texts: 'standard.\n\n',
    },
    {
      delay,
      texts: 'Format ',
    },
    {
      delay,
      texts: 'text ',
    },
    {
      delay,
      texts: 'with **b',
    },
    {
      delay,
      texts: 'old**, _',
    },
    {
      delay,
      texts: 'italic_,',
    },
    {
      delay,
      texts: ' _**comb',
    },
    {
      delay,
      texts: 'ined sty',
    },
    {
      delay,
      texts: 'les**_, ',
    },
    {
      delay,
      texts: '~~strike',
    },
    {
      delay,
      texts: 'through~',
    },
    {
      delay,
      texts: '~, `code',
    },
    {
      delay,
      texts: '` format',
    },
    {
      delay,
      texts: 'ting, an',
    },
    {
      delay,
      texts: 'd [hyper',
    },
    {
      delay,
      texts: 'links](https://en.wikipedia.org/wiki/Hypertext).\n\n',
    },
    {
      delay,
      texts: '```javascript\n',
    },
    {
      delay,
      texts: '// Use code blocks to showcase code snippets\n',
    },
    {
      delay,
      texts: 'function greet() {\n',
    },
    {
      delay,
      texts: '  console.info("Hello World!")\n',
    },
    {
      delay,
      texts: '}\n',
    },
    {
      delay,
      texts: '```\n\n',
    },
    {
      delay,
      texts: '- Simple',
    },
    {
      delay,
      texts: ' lists f',
    },
    {
      delay,
      texts: 'or organ',
    },
    {
      delay,
      texts: 'izing co',
    },
    {
      delay,
      texts: 'ntent\n',
    },
    {
      delay,
      texts: '1. ',
    },
    {
      delay,
      texts: 'Numbered ',
    },
    {
      delay,
      texts: 'lists ',
    },
    {
      delay,
      texts: 'for ',
    },
    {
      delay,
      texts: 'sequential ',
    },
    {
      delay,
      texts: 'steps\n\n',
    },
    {
      delay,
      texts: '| **Plugin**  | **Element** | **Inline** | **Void** |\n',
    },
    {
      delay,
      texts: '| ----------- | ----------- | ---------- | -------- |\n',
    },
    {
      delay,
      texts: '| **Heading** |             |            | No       |\n',
    },
    {
      delay,
      texts: '| **Image**   | Yes         | No         | Yes      |\n',
    },
    {
      delay,
      texts: '| **Ment',
    },
    {
      delay,
      texts: 'ion** | Yes         | Yes        | Yes      |\n\n',
    },
    {
      delay,
      texts:
        '![](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)\n\n',
    },
    {
      delay,
      texts: '- [x] Co',
    },
    {
      delay,
      texts: 'mpleted ',
    },
    {
      delay,
      texts: 'tasks\n',
    },
    {
      delay,
      texts: '- [ ] Pe',
    },
    {
      delay,
      texts: 'nding ta',
    },
    {
      delay,
      texts: 'sks\n\n',
    },
    {
      delay,
      texts: '---\n\n## Advan',
    },
    {
      delay,
      texts: 'ced Feat',
    },
    {
      delay,
      texts: 'ures\n\n',
    },
    {
      delay,
      texts: '<callout> ',
    },
    {
      delay,
      texts: 'The ',
    },
    {
      delay,
      texts: 'following ',
    },
    {
      delay,
      texts: 'node ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'marks ',
    },
    {
      delay,
      texts: 'are ',
    },
    {
      delay,
      texts: 'not ',
    },
    {
      delay,
      texts: 'supported ',
    },
    {
      delay,
      texts: 'in ',
    },
    {
      delay,
      texts: 'Markdown ',
    },
    {
      delay,
      texts: 'but ',
    },
    {
      delay,
      texts: 'can ',
    },
    {
      delay,
      texts: 'be ',
    },
    {
      delay,
      texts: 'serialized ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'deserialized ',
    },
    {
      delay,
      texts: 'using ',
    },
    {
      delay,
      texts: 'MDX ',
    },
    {
      delay,
      texts: 'or ',
    },
    {
      delay,
      texts: 'specialized ',
    },
    {
      delay,
      texts: 'UnifiedJS ',
    },
    {
      delay,
      texts: 'plugins. ',
    },
    {
      delay,
      texts: '</callout>\n\n',
    },
    {
      delay,
      texts: 'Advanced ',
    },
    {
      delay,
      texts: 'marks: ',
    },
    {
      delay,
      texts: '<kbd>⌘ ',
    },
    {
      delay,
      texts: '+ ',
    },
    {
      delay,
      texts: 'B</kbd>,<u>underlined</u>, ',
    },
    {
      delay,
      texts: '<mark',
    },
    {
      delay,
      texts: '>highli',
    },
    {
      delay,
      texts: 'ghted</m',
    },
    {
      delay,
      texts: 'ark',
    },
    {
      delay,
      texts: '> text, ',
    },
    {
      delay,
      texts: '<span s',
    },
    {
      delay,
      texts: 'tyle="co',
    },
    {
      delay,
      texts: 'lor: #93',
    },
    {
      delay,
      texts: 'C47D;">c',
    },
    {
      delay,
      texts: 'olored t',
    },
    {
      delay,
      texts: 'ext</spa',
    },
    {
      delay,
      texts: 'n> and ',
    },
    {
      delay,
      texts: '<spa',
    },
    {
      delay,
      texts: 'n',
    },
    {
      delay,
      texts: ' style="',
    },
    {
      delay,
      texts: 'backgrou',
    },
    {
      delay,
      texts: 'nd-color',
    },
    {
      delay,
      texts: ': #6C9EE',
    },
    {
      delay,
      texts: 'B;">back',
    },
    {
      delay,
      texts: 'ground h',
    },
    {
      delay,
      texts: 'ighlight',
    },
    {
      delay,
      texts: 's</spa',
    },
    {
      delay,
      texts: 'n> for ',
    },
    {
      delay,
      texts: 'visual e',
    },
    {
      delay,
      texts: 'mphasis.\n\n',
    },
    {
      delay,
      texts: 'Superscript ',
    },
    {
      delay,
      texts: 'like ',
    },
    {
      delay,
      texts: 'E=mc<sup>2</sup> ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'subscript ',
    },
    {
      delay,
      texts: 'like ',
    },
    {
      delay,
      texts: 'H<sub>2</sub>O ',
    },
    {
      delay,
      texts: 'demonstrate ',
    },
    {
      delay,
      texts: 'mathematical ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'chemical ',
    },
    {
      delay,
      texts: 'notation ',
    },
    {
      delay,
      texts: 'capabilities.\n\n',
    },
    {
      delay,
      texts: 'Add ',
    },
    {
      delay,
      texts: 'mentions ',
    },
    {
      delay,
      texts: 'like ',
    },
    {
      delay,
      texts: '@BB-8, d',
    },
    {
      delay,
      texts: 'ates (<d',
    },
    {
      delay,
      texts: 'ate>2025',
    },
    {
      delay,
      texts: '-05-08</',
    },
    {
      delay,
      texts: 'date>), ',
    },
    {
      delay,
      texts: 'and math',
    },
    {
      delay,
      texts: ' formula',
    },
    {
      delay,
      texts: 's ($E=mc',
    },
    {
      delay,
      texts: '^2$).\n\n',
    },
    {
      delay,
      texts: 'The ',
    },
    {
      delay,
      texts: 'table ',
    },
    {
      delay,
      texts: 'of ',
    },
    {
      delay,
      texts: 'contents ',
    },
    {
      delay,
      texts: 'feature ',
    },
    {
      delay,
      texts: 'automatically ',
    },
    {
      delay,
      texts: 'generates ',
    },
    {
      delay,
      texts: 'document ',
    },
    {
      delay,
      texts: 'structure ',
    },
    {
      delay,
      texts: 'for ',
    },
    {
      delay,
      texts: 'easy ',
    },
    {
      delay,
      texts: 'navigation.\n\n',
    },
    {
      delay,
      texts: '<toc ',
    },
    {
      delay,
      texts: '/>\n\n',
    },
    {
      delay,
      texts: 'Math ',
    },
    {
      delay,
      texts: 'formula ',
    },
    {
      delay,
      texts: 'support ',
    },
    {
      delay,
      texts: 'makes ',
    },
    {
      delay,
      texts: 'displaying ',
    },
    {
      delay,
      texts: 'complex ',
    },
    {
      delay,
      texts: 'mathematical ',
    },
    {
      delay,
      texts: 'expressions ',
    },
    {
      delay,
      texts: 'simple.\n\n',
    },
    {
      delay,
      texts: '$$\n',
    },
    {
      delay,
      texts: 'a^2',
    },
    {
      delay,
      texts: '+b^2',
    },
    {
      delay,
      texts: '=c^2\n',
    },
    {
      delay,
      texts: '$$\n\n',
    },
    {
      delay,
      texts: 'Multi-co',
    },
    {
      delay,
      texts: 'lumn lay',
    },
    {
      delay,
      texts: 'out feat',
    },
    {
      delay,
      texts: 'ures ena',
    },
    {
      delay,
      texts: 'ble rich',
    },
    {
      delay,
      texts: 'er page ',
    },
    {
      delay,
      texts: 'designs ',
    },
    {
      delay,
      texts: 'and cont',
    },
    {
      delay,
      texts: 'ent layo',
    },
    {
      delay,
      texts: 'uts.\n\n',
    },
    // {
    //  delay,
    //   texts: '<column_group layout="[50,50]">\n',
    // },
    // {
    //  delay,
    //   texts: '<column width="50%">\n',
    // },
    // {
    //  delay,
    //   texts: '  left\n',
    // },
    // {
    //  delay,
    //   texts: '</column>\n',
    // },
    // {
    //  delay,
    //   texts: '<column width="50%">\n',
    // },
    // {
    //  delay,
    //   texts: '  right\n',
    // },
    // {
    //  delay,
    //   texts: '</column>\n',
    // },
    // {
    //  delay,
    //   texts: '</column_group>\n\n',
    // },
    {
      delay,
      texts: 'PDF ',
    },
    {
      delay,
      texts: 'embedding ',
    },
    {
      delay,
      texts: 'makes ',
    },
    {
      delay,
      texts: 'document ',
    },
    {
      delay,
      texts: 'referencing ',
    },
    {
      delay,
      texts: 'simple ',
    },
    {
      delay,
      texts: 'and ',
    },
    {
      delay,
      texts: 'intuitive.\n\n',
    },
    {
      delay,
      texts: '<file ',
    },
    {
      delay,
      texts: 'name="sample.pdf" ',
    },
    {
      delay,
      texts: 'align="center" ',
    },
    {
      delay,
      texts:
        'src="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf" width="80%" isUpload="true" />\n\n',
    },
    {
      delay,
      texts: 'Audio ',
    },
    {
      delay,
      texts: 'players ',
    },
    {
      delay,
      texts: 'can ',
    },
    {
      delay,
      texts: 'be ',
    },
    {
      delay,
      texts: 'embedded ',
    },
    {
      delay,
      texts: 'directly ',
    },
    {
      delay,
      texts: 'into ',
    },
    {
      delay,
      texts: 'documents, ',
    },
    {
      delay,
      texts: 'supporting ',
    },
    {
      delay,
      texts: 'online ',
    },
    {
      delay,
      texts: 'audio ',
    },
    {
      delay,
      texts: 'resources.\n\n',
    },
    {
      delay,
      texts: '<audio ',
    },
    {
      delay,
      texts: 'align="center" ',
    },
    {
      delay,
      texts:
        'src="https://samplelib.com/lib/preview/mp3/sample-3s.mp3" width="80%" />\n\n',
    },
    {
      delay,
      texts: 'Video ',
    },
    {
      delay,
      texts: 'playback ',
    },
    {
      delay,
      texts: 'features ',
    },
    {
      delay,
      texts: 'support ',
    },
    {
      delay,
      texts: 'embedding ',
    },
    {
      delay,
      texts: 'various ',
    },
    {
      delay,
      texts: 'online ',
    },
    {
      delay,
      texts: 'video ',
    },
    {
      delay,
      texts: 'resources, ',
    },
    {
      delay,
      texts: 'enriching ',
    },
    {
      delay,
      texts: 'document ',
    },
    {
      delay,
      texts: 'content.\n\n',
    },
    {
      delay,
      texts: '<video ',
    },
    {
      delay,
      texts: 'align="center" ',
    },
    {
      delay,
      texts:
        'src="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4" width="80%" isUpload="true" />',
    },
  ],
];
