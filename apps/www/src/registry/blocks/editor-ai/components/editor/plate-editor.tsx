'use client';

import type { CommentThread } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { createCommentValue } from '@/registry/components/editor/comment';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { SettingsDialog } from '@/registry/components/editor/settings-dialog';

export function PlateEditor() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: {
            alice: {
              id: 'alice',
              name: 'Alice',
              avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=alice6',
            },
            bob: {
              id: 'bob',
              name: 'Bob',
              avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=bob4',
            },
            charlie: {
              id: 'charlie',
              name: 'Charlie',
              avatarUrl: 'https://api.dicebear.com/9.x/glass/svg?seed=charlie2',
            },
          },
          initialThreads,
        },
      }),
    ],
    initialValue: value,
  });

  return (
    <TooltipProvider>
      <Plate editor={editor}>
        <EditorContainer className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
          <Editor className="min-w-0" variant="demo" />
        </EditorContainer>

        <SettingsDialog />
      </Plate>
    </TooltipProvider>
  );
}

const initialThreads: CommentThread[] = [
  {
    id: 'discussion1',
    createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
    resolved: false,
    status: 'published',
    excerpt: 'comments',
    userId: 'charlie',
    target: {
      type: 'range',
      range: {
        anchor: { path: [3, 6, 0], offset: 0 },
        focus: { path: [3, 7], offset: 22 },
      },
    },
    messages: [
      {
        id: 'discussion1-comment',
        userId: 'charlie',
        createdAt: new Date(Date.now() - 10 * 60_000).toISOString(),
        body: createCommentValue(
          'Comments are a great way to provide feedback and discuss changes.'
        ),
      },
      {
        id: 'discussion1-reply',
        userId: 'bob',
        createdAt: new Date(Date.now() - 8 * 60_000).toISOString(),
        body: createCommentValue(
          'Agreed! The link to the docs makes it easy to learn more.'
        ),
      },
    ],
  },
  {
    id: 'discussion2',
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    resolved: false,
    status: 'published',
    excerpt: 'overlapping',
    userId: 'bob',
    target: {
      type: 'range',
      range: {
        anchor: { path: [3, 8], offset: 0 },
        focus: { path: [3, 8], offset: 11 },
      },
    },
    messages: [
      {
        id: 'discussion2-comment',
        userId: 'bob',
        createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
        body: createCommentValue(
          'Nice demonstration of overlapping annotations with both comments and suggestions!'
        ),
      },
      {
        id: 'discussion2-reply',
        userId: 'charlie',
        createdAt: new Date(Date.now() - 3 * 60_000).toISOString(),
        body: createCommentValue(
          'This helps users understand how powerful the editor can be.'
        ),
      },
    ],
  },
];

const reviewCreatedAt = new Date('2024-01-01T00:00:00Z').getTime();

const value = {
  children: [
    {
      children: [{ text: 'Welcome to the Plate Playground!' }],
      level: 1,
      type: 'heading',
    },
    {
      children: [
        { text: 'Experience a modern rich-text editor built with ' },
        {
          children: [{ text: 'React' }],
          type: 'link',
          url: 'https://reactjs.org',
        },
        {
          text: ". This playground showcases just a part of Plate's capabilities. ",
        },
        {
          children: [{ text: 'Explore the documentation' }],
          type: 'link',
          url: '/docs',
        },
        { text: ' to discover more.' },
      ],
      type: 'paragraph',
    },
    // Suggestions & Comments Section
    {
      children: [{ text: 'Collaborative Editing' }],
      level: 2,
      type: 'heading',
    },
    {
      children: [
        { text: 'Review and refine content seamlessly. Use ' },
        {
          children: [
            {
              suggestion: true,
              suggestion_playground1: {
                id: 'playground1',
                createdAt: reviewCreatedAt,
                type: 'insert',
                userId: 'alice',
              },
              text: 'suggestions',
            },
          ],
          type: 'link',
          url: '/docs/suggestion',
        },
        {
          suggestion: true,
          suggestion_playground1: {
            id: 'playground1',
            createdAt: reviewCreatedAt,
            type: 'insert',
            userId: 'alice',
          },
          text: ' ',
        },
        {
          suggestion: true,
          suggestion_playground1: {
            id: 'playground1',
            createdAt: reviewCreatedAt,
            type: 'insert',
            userId: 'alice',
          },
          text: 'like this added text',
        },
        { text: ' or to ' },
        {
          suggestion: true,
          suggestion_playground2: {
            id: 'playground2',
            createdAt: reviewCreatedAt + 1,
            type: 'remove',
            userId: 'bob',
          },
          text: 'mark text for removal',
        },
        { text: '. Discuss changes using ' },
        {
          children: [{ text: 'comments' }],
          type: 'link',
          url: '/docs/comment',
        },
        { text: ' on many text segments' },
        { text: '. You can even have ' },
        {
          suggestion: true,
          suggestion_playground3: {
            id: 'playground3',
            createdAt: reviewCreatedAt + 2,
            type: 'insert',
            userId: 'charlie',
          },
          text: 'overlapping',
        },
        { text: ' annotations!' },
      ],
      type: 'paragraph',
    },
    // {
    //   children: [
    //     {
    //       text: 'Block-level suggestions are also supported for broader feedback.',
    //     },
    //   ],
    //   suggestion: {
    //     suggestionId: 'suggestionBlock1',
    //     type: 'block',
    //     userId: 'charlie',
    //   },
    //   type: 'paragraph',
    // },
    // AI Section
    {
      children: [{ text: 'AI-Powered Editing' }],
      level: 2,
      type: 'heading',
    },
    {
      children: [
        { text: 'Boost your productivity with integrated ' },
        {
          children: [{ text: 'AI SDK' }],
          type: 'link',
          url: '/docs/ai',
        },
        { text: '. Press ' },
        { kbd: true, text: '⌘+J' },
        { text: ' or ' },
        { kbd: true, text: 'Space' },
        { text: ' in an empty line to:' },
      ],
      type: 'paragraph',
    },
    {
      children: [
        { text: 'Generate content (continue writing, summarize, explain)' },
      ],
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
    },
    {
      children: [
        { text: 'Edit existing text (improve, fix grammar, change tone)' },
      ],
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
    },
    // Core Features Section (Combined)
    {
      children: [{ text: 'Rich Content Editing' }],
      level: 2,
      type: 'heading',
    },
    {
      children: [
        { text: 'Structure your content with ' },
        {
          children: [{ text: 'headings' }],
          type: 'link',
          url: '/docs/heading',
        },
        { text: ', ' },
        {
          children: [{ text: 'lists' }],
          type: 'link',
          url: '/docs/list',
        },
        { text: ', and ' },
        {
          children: [{ text: 'quotes' }],
          type: 'link',
          url: '/docs/blockquote',
        },
        { text: '. Apply ' },
        {
          children: [{ text: 'marks' }],
          type: 'link',
          url: '/docs/basic-marks',
        },
        { text: ' like ' },
        { bold: true, text: 'bold' },
        { text: ', ' },
        { italic: true, text: 'italic' },
        { text: ', ' },
        { text: 'underline', underline: true },
        { text: ', ' },
        { strikethrough: true, text: 'strikethrough' },
        { text: ', and ' },
        { code: true, text: 'code' },
        { text: '. Use ' },
        {
          children: [{ text: 'autoformatting' }],
          type: 'link',
          url: '/docs/autoformat',
        },
        { text: ' for ' },
        {
          children: [{ text: 'Markdown' }],
          type: 'link',
          url: '/docs/markdown',
        },
        { text: '-like shortcuts (e.g., ' },
        { kbd: true, text: '* ' },
        { text: ' for lists, ' },
        { kbd: true, text: '# ' },
        { text: ' for H1).' },
      ],
      type: 'paragraph',
    },
    {
      children: [
        {
          children: [
            {
              text: 'Blockquotes can group paragraphs, quoted lists, and reply chains.',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              text: 'Markdown blockquotes keep this nested structure instead of flattening it.',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              text: 'Quoted list item inside the same container.',
            },
          ],
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [{ text: 'Nested blockquotes work here too.' }],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ],
      type: 'blockquote',
    },
    {
      children: [
        {
          text: "function hello() {\n  console.info('Code blocks are supported!');\n}",
        },
      ],
      language: 'javascript',
      type: 'codeBlock',
    },
    {
      children: [
        { text: 'Create ' },
        {
          children: [{ text: 'links' }],
          type: 'link',
          url: '/docs/link',
        },
        { text: ', ' },
        {
          children: [{ text: '@mention' }],
          type: 'link',
          url: '/docs/mention',
        },
        { text: ' users like ' },
        {
          children: [{ text: '' }],
          label: 'Alice',
          ref: 'alice',
          type: 'mention',
        },
        { text: ', or insert ' },
        {
          children: [{ text: 'emojis' }],
          type: 'link',
          url: '/docs/emoji',
        },
        { text: ' ✨. Use the ' },
        {
          children: [{ text: 'slash command' }],
          type: 'link',
          url: '/docs/slash-command',
        },
        { text: ' (/) for quick access to elements.' },
      ],
      type: 'paragraph',
    },
    // Table Section
    {
      children: [{ text: 'How Plate Compares' }],
      level: 3,
      type: 'heading',
    },
    {
      children: [
        {
          text: 'Plate offers many features out-of-the-box as free, open-source plugins.',
        },
      ],
      type: 'paragraph',
    },
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [{ bold: true, text: 'Feature' }],
                  type: 'paragraph',
                },
              ],
              header: true,
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ bold: true, text: 'Plate (Free & OSS)' }],
                  type: 'paragraph',
                },
              ],
              header: true,
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ bold: true, text: 'Tiptap' }],
                  type: 'paragraph',
                },
              ],
              header: true,
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [{ children: [{ text: 'AI' }], type: 'paragraph' }],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: 'Paid Extension' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                { children: [{ text: 'Comments' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: 'Paid Extension' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                { children: [{ text: 'Suggestions' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ text: 'Paid (Comments Pro)' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                { children: [{ text: 'Emoji Picker' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: 'Paid Extension' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                {
                  children: [{ text: 'Table of Contents' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: 'Paid Extension' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                { children: [{ text: 'Drag Handle' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                { children: [{ text: 'Paid Extension' }], type: 'paragraph' },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
        {
          children: [
            {
              children: [
                {
                  children: [{ text: 'Collaboration (Yjs)' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  textAlign: 'center',
                  children: [{ text: '✅' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
            {
              children: [
                {
                  children: [{ text: 'Hocuspocus (OSS/Paid)' }],
                  type: 'paragraph',
                },
              ],
              type: 'tableCell',
            },
          ],
          type: 'tableRow',
        },
      ],
      type: 'table',
    },
    // Media Section
    {
      children: [{ text: 'Images and Media' }],
      level: 3,
      type: 'heading',
    },
    {
      children: [
        {
          text: 'Embed rich media like images directly in your content. Supports ',
        },
        {
          children: [{ text: 'Media uploads' }],
          type: 'link',
          url: '/docs/media',
        },
        {
          text: ' and ',
        },
        {
          children: [{ text: 'drag & drop' }],
          type: 'link',
          url: '/docs/dnd',
        },
        {
          text: ' for a smooth experience.',
        },
      ],
      type: 'paragraph',
    },
    {
      textAlign: 'center',
      children: [{ text: 'Images with captions provide context.' }],
      type: 'image',
      url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      width: '75%',
    },
    {
      children: [{ text: '' }],
      name: 'sample.pdf',
      type: 'file',
      url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
    },
    {
      children: [{ text: '' }],
      type: 'audio',
      url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
    },
    {
      children: [{ text: 'Table of Contents' }],
      level: 3,
      type: 'heading',
    },
    {
      children: [{ text: '' }],
      type: 'toc',
    },
    {
      children: [{ text: '' }],
      type: 'paragraph',
    },
  ],
};
