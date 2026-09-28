import { faker } from '@faker-js/faker';
import { UI_MESSAGE_STREAM_HEADERS } from 'ai';
import { NodeApi, nanoid } from 'platejs';
import type { AIChatRequestContext } from 'platejs/ai';

import { getCommentBlocks } from '@/registry/app/api/ai/command/prompt/getCommentPrompt';
import type { ChatMessage } from '@/registry/components/editor/use-chat';

type DemoSample = 'comment' | 'continue-writing' | 'markdown' | 'table';

export async function createAIChatDemoResponse({
  messages,
  ctx,
  signal,
}: {
  messages: ChatMessage[];
  ctx?: AIChatRequestContext;
  signal: AbortSignal;
}) {
  let sample: DemoSample | null = null;

  try {
    const content = messages
      .at(-1)
      ?.parts.find((part) => part.type === 'text')?.text;

    const toolName = ctx?.toolName;

    if (toolName === 'comment') {
      sample = 'comment';
    } else if (toolName === 'edit') {
      if ((ctx?.refs.tableCells.length ?? 0) > 1) sample = 'table';
    } else if (content === 'Generate a markdown sample') {
      sample = 'markdown';
    } else if (
      content?.includes('Continue writing AFTER <Block>') ||
      content?.includes('Start writing a new paragraph AFTER <Document>')
    ) {
      sample = 'continue-writing';
    } else if (!toolName && content?.includes('comment')) {
      sample = 'comment';
    }

    if (!sample && !toolName && (ctx?.refs.tableCells.length ?? 0) > 1) {
      sample = 'table';
    }
  } catch {
    sample = null;
  }

  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      const reason: unknown = signal.reason;
      reject(
        reason instanceof Error
          ? reason
          : new DOMException('AI request aborted', 'AbortError')
      );
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, 400);
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
  signal.throwIfAborted();

  const stream = fakeStreamText({
    context: ctx,
    sample,
    signal,
  });

  const response = new Response(stream, {
    headers: UI_MESSAGE_STREAM_HEADERS,
  });

  return response;
}

const fakeStreamText = ({
  chunkCount = 10,
  context,
  sample = null,
  signal,
}: {
  context?: AIChatRequestContext;
  chunkCount?: number;
  sample?: DemoSample | null;
  signal?: AbortSignal;
}) => {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const blocks = (() => {
        if (sample === 'markdown') {
          return markdownChunks;
        }

        if (sample === 'continue-writing') {
          return continueWritingChunks;
        }

        if (sample === 'comment') {
          const commentChunks = createCommentChunks(context);
          return commentChunks;
        }

        if (sample === 'table') {
          const tableChunks = createTableCellChunks(context);
          return tableChunks;
        }

        return [
          Array.from({ length: chunkCount }, () => ({
            delay: faker.number.int({ max: 100, min: 30 }),
            texts: `${faker.lorem.words({ max: 3, min: 1 })} `,
          })),

          Array.from({ length: chunkCount + 2 }, () => ({
            delay: faker.number.int({ max: 100, min: 30 }),
            texts: `${faker.lorem.words({ max: 3, min: 1 })} `,
          })),

          Array.from({ length: chunkCount + 4 }, () => ({
            delay: faker.number.int({ max: 100, min: 30 }),
            texts: `${faker.lorem.words({ max: 3, min: 1 })} `,
          })),
        ];
      })();
      if (signal?.aborted) {
        controller.error(new Error('Aborted before start'));
        return;
      }

      const abortHandler = () => {
        controller.error(new Error('Stream aborted'));
      };

      signal?.addEventListener('abort', abortHandler, { once: true });

      // Generate a unique message ID
      const messageId = `msg_${faker.string.alphanumeric(40)}`;

      controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));
      if (sample !== 'comment' && sample !== 'table') {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'data-toolName',
              data: context?.toolName ?? 'generate',
            })}\n\n`
          )
        );
      }
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      if (signal?.aborted) return;

      controller.enqueue(encoder.encode('data: {"type":"start-step"}\n\n'));
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      if (signal?.aborted) return;

      // Handle comment and table data differently (they use data events, not text streams)
      if (sample === 'comment' || sample === 'table') {
        // For comments and tables, send data events directly
        for (const block of blocks) {
          for (const chunk of block) {
            await new Promise((resolve) => {
              setTimeout(resolve, chunk.delay);
            });

            if (signal?.aborted) {
              signal?.removeEventListener('abort', abortHandler);
              return;
            }

            // Send the data event directly (already formatted as JSON)
            controller.enqueue(encoder.encode(`data: ${chunk.texts}\n\n`));
          }
        }
      } else {
        controller.enqueue(
          encoder.encode(
            `data: {"type":"text-start","id":"${messageId}","providerMetadata":{"openai":{"itemId":"${messageId}"}}}\n\n`
          )
        );
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        if (signal?.aborted) return;

        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];

          // Stream the block content
          for (const chunk of block) {
            await new Promise((resolve) => {
              setTimeout(resolve, chunk.delay);
            });

            if (signal?.aborted) {
              signal?.removeEventListener('abort', abortHandler);
              return;
            }

            // Properly escape the text for JSON
            const escapedText = chunk.texts
              // Escape backslashes first
              .replace(/\\/g, '\\\\')
              // Escape quotes
              .replace(/"/g, String.raw`\"`)
              // Escape newlines
              .replace(/\n/g, String.raw`\n`)
              // Escape carriage returns
              .replace(/\r/g, String.raw`\r`)
              // Escape tabs
              .replace(/\t/g, String.raw`\t`);

            controller.enqueue(
              encoder.encode(
                `data: {"type":"text-delta","id":"${messageId}","delta":"${escapedText}"}\n\n`
              )
            );
          }

          // Add double newline after each block except the last one
          if (i < blocks.length - 1) {
            controller.enqueue(
              encoder.encode(
                `data: {"type":"text-delta","id":"${messageId}","delta":"\\n\\n"}\n\n`
              )
            );
          }
        }

        // Send end events
        controller.enqueue(
          encoder.encode(`data: {"type":"text-end","id":"${messageId}"}\n\n`)
        );
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        if (signal?.aborted) return;

        controller.enqueue(encoder.encode('data: {"type":"finish-step"}\n\n'));
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        if (signal?.aborted) return;

        controller.enqueue(encoder.encode('data: {"type":"finish"}\n\n'));
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
        if (signal?.aborted) return;
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));

      signal?.removeEventListener('abort', abortHandler);
      controller.close();
    },
  });
};

const delay = faker.number.int({ max: 20, min: 5 });

const continueWritingChunks = [
  [
    { delay, texts: 'AI can help ' },
    { delay, texts: 'turn an initial idea ' },
    { delay, texts: 'into a clear and useful ' },
    { delay, texts: 'first draft.' },
  ],
];

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

const createCommentChunks = (context?: AIChatRequestContext) => {
  const blocks = context
    ? getCommentBlocks({
        children: context.children,
        refs: context.refs.blocks,
        selection: context.nodeSelection ? null : context.selection,
      }).filter(({ block }) => NodeApi.string(block).trim())
    : [];
  const max = blocks.length;

  if (max === 0) {
    return [
      [{ delay: 50, texts: '{"data":"comment","type":"data-toolName"}' }],
      [
        {
          delay: 100,
          texts: `{"id":"${nanoid()}","data":{"comment":null,"status":"finished"},"type":"data-comment"}`,
        },
      ],
    ];
  }

  const commentCount = Math.ceil(max / 2);

  const result = new Set<number>();

  while (result.size < commentCount) {
    const num = Math.floor(Math.random() * max);
    result.add(num);
  }

  const indexes = Array.from(result).sort((a, b) => a - b);

  const chunks = indexes
    .map((index) => {
      const entry = blocks[index];

      if (!entry) return [];

      const blockString = NodeApi.string(entry.block);
      const endIndex = blockString.indexOf('.');
      const content =
        endIndex === -1 ? blockString : blockString.slice(0, endIndex);

      return [
        {
          delay: faker.number.int({ max: 500, min: 200 }),
          texts: JSON.stringify({
            id: nanoid(),
            data: {
              comment: {
                blockRef: entry.ref,
                comment: faker.lorem.sentence(),
                content,
              },
              status: 'streaming',
            },
            type: 'data-comment',
          }),
        },
      ];
    })
    .filter((chunk) => chunk.length > 0);

  const resultChunks = [
    [{ delay: 50, texts: '{"data":"comment","type":"data-toolName"}' }],
    ...chunks,
    [
      {
        delay: 50,
        texts: `{"id":"${nanoid()}","data":{"comment":null,"status":"finished"},"type":"data-comment"}`,
      },
    ],
  ];

  return resultChunks;
};

const createTableCellChunks = (context?: AIChatRequestContext) => {
  const root = context ? { children: context.children, type: '' } : null;
  const cellRefs =
    root && context
      ? context.refs.tableCells.flatMap(({ path, ref }) =>
          NodeApi.getIf(root, path) ? [ref] : []
        )
      : [];

  if (cellRefs.length === 0) {
    return [
      [{ delay: 50, texts: '{"data":"edit","type":"data-toolName"}' }],
      [
        {
          delay: 100,
          texts: `{"id":"${nanoid()}","data":{"cellUpdate":null,"status":"finished"},"type":"data-table"}`,
        },
      ],
    ];
  }

  const chunks = cellRefs.map((cellRef) => [
    {
      delay: faker.number.int({ max: 300, min: 100 }),
      texts: `{"id":"${nanoid()}","data":{"cellUpdate":{"ref":"${cellRef}","content":"${faker.lorem.sentence()}"},"status":"streaming"},"type":"data-table"}`,
    },
  ]);

  const resultChunks = [
    [{ delay: 50, texts: '{"data":"edit","type":"data-toolName"}' }],
    ...chunks,
    [
      {
        delay: 50,
        texts: `{"id":"${nanoid()}","data":{"cellUpdate":null,"status":"finished"},"type":"data-table"}`,
      },
    ],
  ];

  return resultChunks;
};
