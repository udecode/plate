'use client';

// Fake stream abort control is imperative transport state.

import { type UseChatHelpers, useChat } from '@ai-sdk/react';
import { faker } from '@faker-js/faker';
import { type UIMessage, DefaultChatTransport } from 'ai';
import { NodeApi, TextApi, PLUGINS, nanoid } from 'platejs';
import type { AIChatRequestContext } from 'platejs/ai';
import { AIChatPlugin, createAIChatAdapter } from 'platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from 'platejs/comment';
import { MarkdownPlugin } from 'platejs/markdown';
import { type Editor, useEditor, usePluginStore } from 'platejs/react';
import * as React from 'react';

import { discussionPlugin } from './discussion';

export type AIChatTransportPluginState = {
  chatOptions: {
    api: string;
    body: Record<string, unknown>;
  };
};

export const AIChatTransportPlugin = AIChatPlugin.extend({
  initialState: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  } satisfies AIChatTransportPluginState,
});

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
  const transport = new DefaultChatTransport<ChatMessage>({
    api,
    // Mock the API response. Remove it when you implement the route /api/ai/command
    fetch: (async (input, init) => {
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
      });

      if (!res.ok) {
        let sample: 'comment' | 'markdown' | 'mdx' | 'table' | null = null;

        try {
          const content = body.messages
            .at(-1)
            ?.parts.find((part) => part.type === 'text')?.text;

          if (content?.includes('Generate a markdown sample')) {
            sample = 'markdown';
          } else if (content?.includes('Generate a mdx sample')) {
            sample = 'mdx';
          } else if (content?.includes('comment')) {
            sample = 'comment';
          }

          if (!sample && (body.ctx?.refs.tableCells.length ?? 0) > 1) {
            sample = 'table';
          }
        } catch {
          sample = null;
        }

        const requestAbortController = new AbortController();

        abortController = requestAbortController;

        await new Promise((resolve) => {
          setTimeout(resolve, 400);
        });

        const stream = fakeStreamText({
          context: body.ctx,
          sample,
          signal: requestAbortController.signal,
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
    abortFakeStream: () => {
      abortController?.abort();
      abortController = null;
    },
    transport,
  };
}

export const useEditorChat = () => {
  const editor = useEditor();
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
    onData(data) {
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

        editor.plugin(AIChatPlugin).update.applyTableCellSuggestion(cellUpdate);
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

        const discussions =
          editor.plugin(discussionPlugin).store.get('discussions') || [];

        // Generate a new discussion ID
        const discussionId = nanoid();

        // Create a new comment
        const newComment = {
          id: nanoid(),
          contentRich: [
            { children: [{ text: aiComment.comment }], type: 'paragraph' },
          ],
          createdAt: new Date(),
          discussionId,
          isEdited: false,
          userId: editor.plugin(discussionPlugin).store.get('currentUserId'),
        };

        // Create a new discussion
        const newDiscussion = {
          id: discussionId,
          comments: [newComment],
          createdAt: new Date(),
          documentContent: markdownApi
            .deserialize(aiComment.content)
            .children.map((node) => NodeApi.string(node))
            .join('\n'),
          isResolved: false,
          userId: editor.plugin(discussionPlugin).store.get('currentUserId'),
        };

        // Update discussions
        const updatedDiscussions = [...discussions, newDiscussion];
        editor
          .plugin(discussionPlugin)
          .store.set({ discussions: updatedDiscussions });

        // Apply comment marks to the editor
        editor.update({ history: 'merge' }).nodes.set(
          {
            [getCommentKey(newDiscussion.id)]: true,
            [getTransientCommentKey()]: true,
            [editor.plugin(PLUGINS.comment).schema.key]: true,
          },
          {
            at: range,
            match: TextApi.isText,
            split: true,
          }
        );
      }
    },

    ...options,
  });

  const chat = {
    ...baseChat,
    stop: async () => {
      await baseChat.stop();
      chatTransport.abortFakeStream();
    },
  };
  const publishChat = React.useEffectEvent(() => {
    editor.plugin(AIChatPlugin).store.set({ chat: createAIChatAdapter(chat) });
  });

  React.useEffect(() => {
    publishChat();
  }, [chat.status, chat.messages, chat.error, chatTransport]);

  return chat;
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
  sample?: 'comment' | 'markdown' | 'mdx' | 'table' | null;
  signal?: AbortSignal;
}) => {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const blocks = (() => {
        if (sample === 'markdown') {
          return markdownChunks;
        }

        if (sample === 'mdx') {
          return mdxChunks;
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

      signal?.addEventListener('abort', abortHandler);

      // Generate a unique message ID
      const messageId = `msg_${faker.string.alphanumeric(40)}`;

      controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'));
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      controller.enqueue(encoder.encode('data: {"type":"start-step"}\n\n'));
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

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

        controller.enqueue(encoder.encode('data: {"type":"finish-step"}\n\n'));
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });

        controller.enqueue(encoder.encode('data: {"type":"finish"}\n\n'));
        await new Promise((resolve) => {
          setTimeout(resolve, 10);
        });
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
      texts: '<callout>\n',
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
      texts: 'plugins.\n',
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
    //   texts: '<columnGroup>\n',
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
    //   texts: '</columnGroup>\n\n',
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
      texts:
        'src="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf" width="80%" />\n\n',
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
      texts: 'textAlign="center" ',
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
      texts: 'textAlign="center" ',
    },
    {
      delay,
      texts:
        'provider="file" src="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4" width="80%" />',
    },
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
