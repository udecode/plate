import type { EditorDocumentValue } from 'platejs';
import type { CommentsJSON } from 'platejs/comments';

// Saved native document. Regenerate with apps/www/scripts/generate-rich-text-editor-value.ts.
export const richTextEditorValue: EditorDocumentValue = {
  children: [
    {
      level: 1,
      type: 'heading',
      children: [
        {
          text: 'Welcome to the Plate Playground!',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Experience a modern rich-text editor built with ',
        },
        {
          type: 'link',
          url: 'https://reactjs.org',
          children: [
            {
              text: 'React',
            },
          ],
        },
        {
          text: ". This playground showcases just a part of Plate's capabilities. ",
        },
        {
          type: 'link',
          url: '/docs',
          children: [
            {
              text: 'Explore the documentation',
            },
          ],
        },
        {
          text: ' to discover more.',
        },
      ],
    },
    {
      level: 2,
      type: 'heading',
      children: [
        {
          text: 'Collaborative Editing',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Review and refine content seamlessly. Use ',
        },
        {
          type: 'link',
          url: '/docs/suggestion',
          authored: [
            {
              at: 1_791_864_172_518,
              author: 'alice',
              change: '3eebfcc2-04a2-475e-9c41-c1375ad2b72c',
              kind: 'insert',
            },
          ],
          children: [
            {
              authored: [
                {
                  at: 1_791_864_172_518,
                  author: 'alice',
                  change: '3eebfcc2-04a2-475e-9c41-c1375ad2b72c',
                  kind: 'insert',
                },
              ],
              text: 'suggestions',
            },
          ],
        },
        {
          authored: [
            {
              at: 1_791_864_172_518,
              author: 'alice',
              change: '3eebfcc2-04a2-475e-9c41-c1375ad2b72c',
              kind: 'insert',
            },
          ],
          text: ' like this added text',
        },
        {
          text: ' or to ',
        },
        {
          authored: [
            {
              at: 1_791_864_172_425,
              author: 'bob',
              change: '8b7c7323-a04b-4eac-911c-f4b55fb69550',
              kind: 'delete',
            },
          ],
          text: 'mark text for removal',
        },
        {
          text: '. Discuss changes using ',
        },
        {
          type: 'link',
          url: '/docs/comment',
          children: [
            {
              text: 'comments',
            },
          ],
        },
        {
          text: ' on many text segments. You can even have ',
        },
        {
          authored: [
            {
              at: 1_791_864_172_481,
              author: 'charlie',
              change: '11ecbc4a-799d-4ffe-a1ed-d515e9e0c30b',
              kind: 'insert',
            },
          ],
          text: 'overlapping ',
        },
        {
          text: 'annotations!',
        },
      ],
    },
    {
      level: 2,
      type: 'heading',
      children: [
        {
          text: 'AI-Powered Editing',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Boost your productivity with integrated ',
        },
        {
          type: 'link',
          url: '/docs/ai',
          children: [
            {
              text: 'AI SDK',
            },
          ],
        },
        {
          text: '. Press ',
        },
        {
          kbd: true,
          text: '⌘+J',
        },
        {
          text: ' or ',
        },
        {
          kbd: true,
          text: 'Space',
        },
        {
          text: ' in an empty line to:',
        },
      ],
    },
    {
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
      children: [
        {
          text: 'Generate content (continue writing, summarize, explain)',
        },
      ],
    },
    {
      indent: 1,
      listType: 'bulleted',
      type: 'paragraph',
      children: [
        {
          text: 'Edit existing text (improve, fix grammar, change tone)',
        },
      ],
    },
    {
      level: 2,
      type: 'heading',
      children: [
        {
          text: 'Rich Content Editing',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Structure your content with ',
        },
        {
          type: 'link',
          url: '/docs/heading',
          children: [
            {
              text: 'headings',
            },
          ],
        },
        {
          text: ', ',
        },
        {
          type: 'link',
          url: '/docs/list',
          children: [
            {
              text: 'lists',
            },
          ],
        },
        {
          text: ', and ',
        },
        {
          type: 'link',
          url: '/docs/blockquote',
          children: [
            {
              text: 'quotes',
            },
          ],
        },
        {
          text: '. Apply ',
        },
        {
          type: 'link',
          url: '/docs/basic-marks',
          children: [
            {
              text: 'marks',
            },
          ],
        },
        {
          text: ' like ',
        },
        {
          bold: true,
          text: 'bold',
        },
        {
          text: ', ',
        },
        {
          italic: true,
          text: 'italic',
        },
        {
          text: ', ',
        },
        {
          underline: true,
          text: 'underline',
        },
        {
          text: ', ',
        },
        {
          strikethrough: true,
          text: 'strikethrough',
        },
        {
          text: ', and ',
        },
        {
          code: true,
          text: 'code',
        },
        {
          text: '. Use ',
        },
        {
          type: 'link',
          url: '/docs/autoformat',
          children: [
            {
              text: 'autoformatting',
            },
          ],
        },
        {
          text: ' for ',
        },
        {
          type: 'link',
          url: '/docs/markdown',
          children: [
            {
              text: 'Markdown',
            },
          ],
        },
        {
          text: '-like shortcuts (e.g., ',
        },
        {
          kbd: true,
          text: '* ',
        },
        {
          text: ' for lists, ',
        },
        {
          kbd: true,
          text: '# ',
        },
        {
          text: ' for H1).',
        },
      ],
    },
    {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'Blockquotes can group paragraphs, quoted lists, and reply chains.',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: 'Markdown blockquotes keep this nested structure instead of flattening it.',
            },
          ],
        },
        {
          indent: 1,
          listType: 'bulleted',
          type: 'paragraph',
          children: [
            {
              text: 'Quoted list item inside the same container.',
            },
          ],
        },
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'Nested blockquotes work here too.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      language: 'javascript',
      type: 'codeBlock',
      children: [
        {
          text: "function hello() {\n  console.info('Code blocks are supported!');\n}",
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Create ',
        },
        {
          type: 'link',
          url: '/docs/link',
          children: [
            {
              text: 'links',
            },
          ],
        },
        {
          text: ', ',
        },
        {
          type: 'link',
          url: '/docs/mention',
          children: [
            {
              text: '@mention',
            },
          ],
        },
        {
          text: ' users like ',
        },
        {
          label: 'Alice',
          ref: 'alice',
          type: 'mention',
          children: [
            {
              text: '',
            },
          ],
        },
        {
          text: ', or insert ',
        },
        {
          type: 'link',
          url: '/docs/emoji',
          children: [
            {
              text: 'emojis',
            },
          ],
        },
        {
          text: ' ✨. Use the ',
        },
        {
          type: 'link',
          url: '/docs/slash-command',
          children: [
            {
              text: 'slash command',
            },
          ],
        },
        {
          text: ' (/) for quick access to elements.',
        },
      ],
    },
    {
      level: 3,
      type: 'heading',
      children: [
        {
          text: 'How Plate Compares',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Plate offers many features out-of-the-box as free, open-source plugins.',
        },
      ],
    },
    {
      type: 'table',
      children: [
        {
          type: 'tableRow',
          children: [
            {
              header: true,
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      bold: true,
                      text: 'Feature',
                    },
                  ],
                },
              ],
            },
            {
              header: true,
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      bold: true,
                      text: 'Plate (Free & OSS)',
                    },
                  ],
                },
              ],
            },
            {
              header: true,
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      bold: true,
                      text: 'Tiptap',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'AI',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  textAlign: 'center',
                  type: 'paragraph',
                  children: [
                    {
                      text: '✅',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Paid Extension',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Comments',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  textAlign: 'center',
                  type: 'paragraph',
                  children: [
                    {
                      text: '✅',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Paid Extension',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Suggestions',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  textAlign: 'center',
                  type: 'paragraph',
                  children: [
                    {
                      text: '✅',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Paid (Comments Pro)',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Emoji Picker',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  textAlign: 'center',
                  type: 'paragraph',
                  children: [
                    {
                      text: '✅',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Paid Extension',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Table of Contents',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  textAlign: 'center',
                  type: 'paragraph',
                  children: [
                    {
                      text: '✅',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Paid Extension',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Drag Handle',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  textAlign: 'center',
                  type: 'paragraph',
                  children: [
                    {
                      text: '✅',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Paid Extension',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'tableRow',
          children: [
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Collaboration (Yjs)',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  textAlign: 'center',
                  type: 'paragraph',
                  children: [
                    {
                      text: '✅',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableCell',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Hocuspocus (OSS/Paid)',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      level: 3,
      type: 'heading',
      children: [
        {
          text: 'Images and Media',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: 'Embed rich media like images directly in your content. Supports ',
        },
        {
          type: 'link',
          url: '/docs/media',
          children: [
            {
              text: 'Media uploads',
            },
          ],
        },
        {
          text: ' and ',
        },
        {
          type: 'link',
          url: '/docs/dnd',
          children: [
            {
              text: 'drag & drop',
            },
          ],
        },
        {
          text: ' for a smooth experience.',
        },
      ],
    },
    {
      textAlign: 'center',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      width: '75%',
      children: [
        {
          text: 'Images with captions provide context.',
        },
      ],
    },
    {
      name: 'sample.pdf',
      type: 'file',
      url: 'https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'audio',
      url: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      level: 3,
      type: 'heading',
      children: [
        {
          text: 'Table of Contents',
        },
      ],
    },
    {
      type: 'toc',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
  ],
};

export const richTextEditorComments: CommentsJSON = {
  kind: 'comments',
  version: 1,
  threads: [
    {
      id: 'discussion1',
      createdAt: '2026-09-14T18:18:51.315Z',
      status: 'published',
      excerpt: 'comments',
      userId: 'charlie',
      target: {
        type: 'range',
      },
      messages: [
        {
          id: 'discussion1-comment',
          userId: 'charlie',
          createdAt: '2026-09-14T18:18:51.315Z',
          body: [
            {
              children: [
                {
                  text: 'Comments are a great way to provide feedback and discuss changes.',
                },
              ],
              type: 'paragraph',
            },
          ],
        },
        {
          id: 'discussion1-reply',
          userId: 'bob',
          createdAt: '2026-09-14T18:20:51.315Z',
          body: [
            {
              children: [
                {
                  text: 'Agreed! The link to the docs makes it easy to learn more.',
                },
              ],
              type: 'paragraph',
            },
          ],
        },
      ],
      resolution: null,
    },
    {
      id: 'discussion2',
      createdAt: '2026-09-14T18:23:51.315Z',
      status: 'published',
      excerpt: 'overlapping',
      userId: 'bob',
      target: {
        id: '11ecbc4a-799d-4ffe-a1ed-d515e9e0c30b',
        type: 'change',
      },
      messages: [
        {
          id: 'discussion2-comment',
          userId: 'bob',
          createdAt: '2026-09-14T18:23:51.315Z',
          body: [
            {
              children: [
                {
                  text: 'Nice demonstration of overlapping annotations with both comments and suggestions!',
                },
              ],
              type: 'paragraph',
            },
          ],
        },
        {
          id: 'discussion2-reply',
          userId: 'charlie',
          createdAt: '2026-09-14T18:25:51.315Z',
          body: [
            {
              children: [
                {
                  text: 'This helps users understand how powerful the editor can be.',
                },
              ],
              type: 'paragraph',
            },
          ],
        },
      ],
      resolution: null,
    },
  ],
  ranges: [
    {
      threadId: 'discussion1',
      range: {
        kind: 'range',
        version: 1,
        value: {
          association: 'inward',
          deletion: 'nearest',
          range: {
            anchor: {
              path: [3, 6, 0],
              offset: 0,
            },
            focus: {
              path: [3, 7],
              offset: 22,
            },
          },
          root: 'main',
        },
      },
    },
  ],
};
