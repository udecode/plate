// oxlint-disable-next-line typescript/ban-ts-comment -- Frozen pre-cut source is compiled only by the baseline harness.
// @ts-nocheck -- Frozen pre-cut source is compiled only by the baseline harness.
'use client';

// Fake stream abort control is imperative transport state.

import { type UseChatHelpers, useChat } from '@ai-sdk/react';
import { faker } from '@faker-js/faker';
import { type UIMessage, DefaultChatTransport } from 'ai';
import { NodeApi, nanoid } from 'platejs';
import type { AIChatRequestContext } from 'platejs/ai';
import { AIChatPlugin, type AIChatAdapter } from 'platejs/ai/react';
import { CommentsPlugin } from 'platejs/comments/react';
import { MarkdownPlugin } from 'platejs/markdown';
import { type Editor, useEditor, usePluginStore } from 'platejs/react';
import * as React from 'react';

import { createCommentValue } from '@/registry/components/editor/comment';

const createAIChatAdapter = <TMessage extends UIMessage>(
  chat: UseChatHelpers<TMessage>
): AIChatAdapter => ({
  clear: () => {
    chat.setMessages([]);
  },
  messages: chat.messages,
  regenerate: chat.regenerate,
  sendMessage: (text, options) => chat.sendMessage({ text }, options),
  status: chat.status,
  stop: chat.stop,
});

export type AIChatTransportPluginState = {
  _sessionOwner: symbol | null;
  chatOptions: {
    api: string;
    body: Record<string, unknown>;
  };
};

const initialState: AIChatTransportPluginState = {
  _sessionOwner: null,
  chatOptions: {
    api: '/api/ai/command',
    body: {},
  },
};

export const AIChatTransportPlugin = AIChatPlugin.extend({ initialState });

export type ToolName = 'comment' | 'edit' | 'generate';

export type TComment = {
  comment: {
    blockRef: string;
    comment: string;
    content: string;
  } | null;
  status: 'finished' | 'streaming';
};

export type TTableCellUpdate = {
  cellUpdate: {
    content: string;
    ref: string;
  } | null;
  status: 'finished' | 'streaming';
};

export type MessageDataPart = {
  toolName: ToolName;
  comment: TComment;
  table: TTableCellUpdate;
};

export type Chat = UseChatHelpers<ChatMessage>;

export type ChatMessage = UIMessage<unknown, MessageDataPart>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isToolName = (value: unknown): value is ToolName =>
  value === 'comment' || value === 'edit' || value === 'generate';

const isStreamStatus = (value: unknown): value is 'finished' | 'streaming' =>
  value === 'finished' || value === 'streaming';

const isTableCellUpdate = (value: unknown): value is TTableCellUpdate =>
  isRecord(value) &&
  isStreamStatus(value.status) &&
  (value.cellUpdate === null ||
    (isRecord(value.cellUpdate) &&
      typeof value.cellUpdate.content === 'string' &&
      typeof value.cellUpdate.ref === 'string'));

const isComment = (value: unknown): value is TComment =>
  isRecord(value) &&
  isStreamStatus(value.status) &&
  (value.comment === null ||
    (isRecord(value.comment) &&
      typeof value.comment.blockRef === 'string' &&
      typeof value.comment.comment === 'string' &&
      typeof value.comment.content === 'string'));

type ChatRequestBody = {
  messages: ChatMessage[];
  ctx?: AIChatRequestContext;
  [key: string]: unknown;
};

function createChatTransport({ api, editor }: { api: string; editor: Editor }) {
  let abortController: AbortController | null = null;
  let requestSignal: AbortSignal | undefined;
  const transport = new DefaultChatTransport<ChatMessage>({
    api,
    // Mock the API response. Remove it when you implement the route /api/ai/command
    fetch: (async (input, init) => {
      const requestAbortController = new AbortController();
      abortController = requestAbortController;
      const signal = init?.signal
        ? AbortSignal.any([init.signal, requestAbortController.signal])
        : requestAbortController.signal;
      requestSignal = signal;
      signal.throwIfAborted();
      const bodyOptions = editor.plugin(AIChatTransportPlugin).store.get()
        .chatOptions?.body;

      const initBody = JSON.parse(init?.body as string) as ChatRequestBody;

      const body: ChatRequestBody = {
        ...initBody,
        ...bodyOptions,
      };

      const res = await fetch(input, {
        ...init,
        body: JSON.stringify(body),
        signal,
      });
      if (signal.aborted) {
        await res.body?.cancel();
        signal.throwIfAborted();
      }

      if (!res.ok) {
        let sample: 'comment' | 'markdown' | 'table' | null = null;

        try {
          const content = body.messages
            .at(-1)
            ?.parts.find((part) => part.type === 'text')?.text;

          if (content?.includes('Generate a markdown sample')) {
            sample = 'markdown';
          } else if (content?.includes('comment')) {
            sample = 'comment';
          }

          if (!sample && (body.ctx?.refs.tableCells.length ?? 0) > 1) {
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
          context: body.ctx,
          sample,
          signal,
        });

        const response = new Response(stream, {
          headers: {
            Connection: 'keep-alive',
            'Content-Type': 'text/plain',
          },
        });

        return response;
      }

      return res;
    }) as typeof fetch,
  });

  return {
    getRequestSignal: () => requestSignal,
    abortFakeStream: () => {
      abortController?.abort();
      abortController = null;
    },
    transport,
  };
}

export const useEditorChat = ({
  isLive,
  isOwner,
}: {
  isLive: () => boolean;
  isOwner: () => boolean;
}) => {
  const editor = useEditor();
  const comments = editor.plugin(CommentsPlugin);
  const markdownApi = editor.plugin(MarkdownPlugin).api;
  const options = usePluginStore(AIChatTransportPlugin, 'chatOptions');

  const chatTransport = React.useMemo(
    () =>
      createChatTransport({
        api: options.api || '/api/ai/command',
        editor,
      }),
    [editor, options.api]
  );

  const baseChat = useChat<ChatMessage>({
    id: 'editor',
    transport: chatTransport.transport,
    async onData(data) {
      const requestSignal = chatTransport.getRequestSignal();
      const isRequestLive = () =>
        isLive() &&
        !requestSignal?.aborted &&
        requestSignal === chatTransport.getRequestSignal();
      if (!isRequestLive()) return;
      if (data.type === 'data-toolName' && isToolName(data.data)) {
        editor.plugin(AIChatPlugin).store.set({ toolName: data.data });
      }

      if (data.type === 'data-table' && isTableCellUpdate(data.data)) {
        const tableData = data.data;

        if (tableData.status === 'finished') {
          const chatSelection = editor
            .plugin(AIChatPlugin)
            .store.get('chatSelection');

          if (!chatSelection) return;

          editor.update.selection.set(chatSelection);

          return;
        }

        const { cellUpdate } = tableData;

        if (cellUpdate == null) {
          throw new Error('Streaming table data requires a cell update');
        }

        editor.plugin(AIChatPlugin).api.setTablePreview(cellUpdate);
      }

      if (data.type === 'data-comment' && isComment(data.data)) {
        const commentData = data.data;

        if (commentData.status === 'finished') {
          editor.update.selection.set(null);

          return;
        }

        const aiComment = commentData.comment;

        if (aiComment == null) {
          throw new Error('Streaming comment data requires a comment');
        }

        const range = editor.plugin(AIChatPlugin).read.commentRange(aiComment);

        if (!range) {
          console.warn('No range found for AI comment');
          return;
        }

        if (!comments.installed) {
          console.warn('AI comments require CommentsPlugin');
          return;
        }

        let id: string | null;
        try {
          id = await comments.api.createThread({
            target: { range, type: 'range' },
            body: createCommentValue(aiComment.comment),
            excerpt: markdownApi
              .deserialize(aiComment.content)
              .children.map((node) => NodeApi.string(node))
              .join('\n'),
            status: 'draft',
          });
        } catch (error) {
          // The SDK does not await onData promises, so rejection must terminate here.
          if (isRequestLive()) {
            console.warn('Could not create AI comment', error);
          }
          return;
        }

        if (id) {
          if (isRequestLive()) {
            comments.api.setActive([id]);
          } else comments.api.discardDraft(id);
        }
      }
    },

    ...options,
  });

  const { stop: stopChat } = baseChat;
  const { stop, finish } = React.useMemo(() => {
    const finishStream = () => {
      const { store } = editor.plugin(AIChatPlugin);
      // Completing a stream leaves pending comment creation valid until authority is revoked.
      if (store.get('chat')?.stop === stopSession) {
        store.set({
          streaming: false,
          _blockPath: null,
        });
      }
    };
    const stopSession = () => {
      chatTransport.abortFakeStream();
      finishStream();
      return stopChat();
    };
    return { stop: stopSession, finish: finishStream };
  }, [editor, stopChat, chatTransport]);
  const chat = {
    ...baseChat,
    sendMessage: async (...args: Parameters<typeof baseChat.sendMessage>) => {
      if (!isLive()) {
        throw new Error(
          'AIChatSession requires a writable command owner and mounted view.'
        );
      }
      return baseChat.sendMessage(...args);
    },
    regenerate: async (...args: Parameters<typeof baseChat.regenerate>) => {
      if (!isLive()) {
        throw new Error(
          'AIChatSession requires a writable command owner and mounted view.'
        );
      }
      return baseChat.regenerate(...args);
    },
    stop,
  };
  const publishChat = React.useEffectEvent(() => {
    if (!isOwner()) return;
    editor.plugin(AIChatPlugin).store.set({ chat: createAIChatAdapter(chat) });
  });
  React.useEffect(
    () => () => {
      void stop();
      const { store } = editor.plugin(AIChatPlugin);
      if (store.get('chat')?.stop === stop) store.set({ chat: null });
    },
    [editor, stop]
  );
  React.useEffect(() => {
    publishChat();
  }, [chat.status, chat.messages, chat.error, chatTransport]);
  return {
    ...chat,
    finish,
    isStreamingLive: () =>
      isLive() && !chatTransport.getRequestSignal()?.aborted,
  };
};

// Used for testing. Remove it after implementing the useEditorChat API.
const fakeStreamText = ({
  chunkCount = 10,
  context,
  sample = null,
  signal,
}: {
  context?: AIChatRequestContext;
  chunkCount?: number;
  sample?: 'comment' | 'markdown' | 'table' | null;
  signal?: AbortSignal;
}) => {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const blocks = (() => {
        if (sample === 'markdown') {
          return markdownChunks;
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
  const root = context ? { children: context.children, type: '' } : null;
  const blocks =
    root && context
      ? context.refs.blocks.flatMap(({ path, ref }) => {
          const block = NodeApi.getIf(root, path);

          return block ? [{ block, ref }] : [];
        })
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
          texts: `{"id":"${nanoid()}","data":{"comment":{"blockRef":"${
            entry.ref
          }","comment":"${faker.lorem.sentence()}","content":"${content}"},"status":"streaming"},"type":"data-comment"}`,
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
