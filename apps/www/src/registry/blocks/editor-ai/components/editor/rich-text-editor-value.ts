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
          text: 'Review and refine content seamlessly. Use  or to mark text for removal. Discuss changes using ',
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
          text: ' on many text segments. You can even have annotations!',
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
  meta: {
    authored: {
      value: {
        acceptedPositions: [
          [
            'main',
            {
              birth: null,
              deleted: null,
              present: true,
              spans: [
                {
                  birth: null,
                  length: 2111,
                  offset: 0,
                  origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                  placement: null,
                  properties: {},
                },
              ],
            },
          ],
        ],
        changes: [
          [
            'alice',
            1_791_079_347_961,
            [],
            ['c332dae4-97b3-400a-b84d-802300431631:3'],
            '15384687-6df7-4250-8606-9d9b5382b35d',
            'mixed',
            ['c332dae4-97b3-400a-b84d-802300431631:3'],
            [],
            1,
            'pending',
            1_791_079_347_961,
            {
              parts: [
                [
                  '["c332dae4-97b3-400a-b84d-802300431631:3",1,"main",1]',
                  {
                    root: 'main',
                    at: {
                      left: {
                        offset: 1,
                        origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                      },
                      right: {
                        offset: 1,
                        origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                      },
                    },
                    before: null,
                    after: {
                      slice: {
                        content: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                type: 'link',
                                url: '/docs/suggestion',
                                children: [
                                  {
                                    text: 'suggestions',
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                        openEnd: 1,
                        openStart: 1,
                      },
                      from: 1,
                      to: 16,
                      positions: [
                        [
                          'main',
                          {
                            birth: null,
                            deleted: null,
                            present: true,
                            spans: [
                              {
                                birth: null,
                                length: 1,
                                offset: 238,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                                length: 15,
                                offset: 2,
                                origin:
                                  'c332dae4-97b3-400a-b84d-802300431631:3:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 403,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                            ],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  '["c332dae4-97b3-400a-b84d-802300431631:3",2,"main",1]',
                  {
                    root: 'main',
                    at: {
                      left: {
                        offset: 2,
                        origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                      },
                      right: {
                        offset: 282,
                        origin:
                          'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                      },
                    },
                    before: null,
                    after: {
                      slice: {
                        content: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: ' like this added text',
                              },
                            ],
                          },
                        ],
                        openEnd: 1,
                        openStart: 1,
                      },
                      from: 2,
                      to: 23,
                      positions: [
                        [
                          'main',
                          {
                            birth: null,
                            deleted: null,
                            present: true,
                            spans: [
                              {
                                birth: null,
                                length: 1,
                                offset: 238,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                                length: 1,
                                offset: 1,
                                origin:
                                  'c332dae4-97b3-400a-b84d-802300431631:3:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                                length: 21,
                                offset: 17,
                                origin:
                                  'c332dae4-97b3-400a-b84d-802300431631:3:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 334,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 403,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                            ],
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],
            },
          ],
          [
            'bob',
            1_791_079_347_938,
            [],
            ['c332dae4-97b3-400a-b84d-802300431631:1'],
            '7e1a0b94-c052-45c0-b2aa-be475f1e69a2',
            'delete',
            ['c332dae4-97b3-400a-b84d-802300431631:1'],
            [],
            1,
            'pending',
            1_791_079_347_938,
            {
              parts: [
                [
                  '["c332dae4-97b3-400a-b84d-802300431631:1",0,"main",1]',
                  {
                    root: 'main',
                    at: {
                      left: {
                        offset: 289,
                        origin:
                          'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                      },
                      right: {
                        offset: 289,
                        origin:
                          'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                      },
                    },
                    before: {
                      slice: {
                        content: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'mark text for removal',
                              },
                            ],
                          },
                        ],
                        openEnd: 1,
                        openStart: 1,
                      },
                      from: 2,
                      to: 23,
                      positions: [
                        [
                          'main',
                          {
                            birth: null,
                            deleted: null,
                            present: true,
                            spans: [
                              {
                                birth: null,
                                length: 1,
                                offset: 238,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 239,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 21,
                                offset: 289,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 334,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 403,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                            ],
                          },
                        ],
                      ],
                    },
                    after: null,
                  },
                ],
              ],
            },
          ],
          [
            'charlie',
            1_791_079_347_947,
            [],
            ['c332dae4-97b3-400a-b84d-802300431631:2'],
            'b4b4910b-aae6-43d2-ae42-7d8c6a5df54e',
            'insert',
            ['c332dae4-97b3-400a-b84d-802300431631:2'],
            [],
            1,
            'pending',
            1_791_079_347_947,
            {
              parts: [
                [
                  '["c332dae4-97b3-400a-b84d-802300431631:2",0,"main",1]',
                  {
                    root: 'main',
                    at: {
                      left: {
                        offset: 390,
                        origin:
                          'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                      },
                      right: {
                        offset: 390,
                        origin:
                          'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                      },
                    },
                    before: null,
                    after: {
                      slice: {
                        content: [
                          {
                            type: 'paragraph',
                            children: [
                              {
                                text: 'overlapping ',
                              },
                            ],
                          },
                        ],
                        openEnd: 1,
                        openStart: 1,
                      },
                      from: 2,
                      to: 14,
                      positions: [
                        [
                          'main',
                          {
                            birth: null,
                            deleted: null,
                            present: true,
                            spans: [
                              {
                                birth: null,
                                length: 1,
                                offset: 238,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 347,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: 'b4b4910b-aae6-43d2-ae42-7d8c6a5df54e',
                                length: 12,
                                offset: 0,
                                origin:
                                  'c332dae4-97b3-400a-b84d-802300431631:2:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 402,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                              {
                                birth: null,
                                length: 1,
                                offset: 403,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                                placement: null,
                                properties: {},
                              },
                            ],
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],
            },
          ],
        ],
        documentId: 'eff4466d-e989-4ccc-834a-edde5c943219',
        operations: [
          [
            0,
            'bob',
            '7e1a0b94-c052-45c0-b2aa-be475f1e69a2',
            1,
            [],
            'c332dae4-97b3-400a-b84d-802300431631:1',
            null,
            [],
            true,
            'c332dae4-97b3-400a-b84d-802300431631',
            [],
            1,
            1_791_079_347_938,
            'delete',
            'fc08620123aebecd',
            '[[{"primary":[{"length":289},{"length":21,"replacement":[]},{"length":1801}],"version":3},[],[[null,[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",289],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",310]],[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",289],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",310]],[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",289],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",289]],[],[[null,21,289,"eff4466d-e989-4ccc-834a-edde5c943219:base:main",null,{}]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":239,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":21,"offset":289,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":"mark text for removal"}]}],"openEnd":1,"openStart":1},"to":23,"kind":"delete"},"main",1,[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",310],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",310]],null]]]]',
            {
              digest:
                'f3c0a6197a1e80173a5255c3e6b02566b7af3cd0fc424fecd9cdf58612af3dff',
              kind: 'delete',
              steps: [
                {
                  rootTargets: [],
                  targets: [
                    {
                      association: null,
                      from: {
                        left: {
                          offset: 289,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 289,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 310,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [
                        {
                          birth: null,
                          length: 21,
                          offset: 289,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      inserted: [],
                      afterFrom: {
                        left: {
                          offset: 289,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 289,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      insertedContent: null,
                      retained: null,
                      length: 21,
                      properties: null,
                      textBoundary: null,
                    },
                  ],
                },
              ],
            },
            0,
          ],
          [
            0,
            'charlie',
            'b4b4910b-aae6-43d2-ae42-7d8c6a5df54e',
            2,
            [],
            'c332dae4-97b3-400a-b84d-802300431631:2',
            null,
            ['c332dae4-97b3-400a-b84d-802300431631:1'],
            true,
            'c332dae4-97b3-400a-b84d-802300431631',
            [['c332dae4-97b3-400a-b84d-802300431631', 1]],
            2,
            1_791_079_347_947,
            'insert',
            '1494a3bc48f5f060',
            '[[{"primary":[{"length":369},{"length":0,"replacement":[{"kind":"text","text":"overlapping "}]},{"length":1721}],"version":3},[],[[null,[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",390],["c332dae4-97b3-400a-b84d-802300431631:2:main",0]],[["c332dae4-97b3-400a-b84d-802300431631:2:main",12],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",390]],[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",390],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",390]],[["b4b4910b-aae6-43d2-ae42-7d8c6a5df54e",12,0,"c332dae4-97b3-400a-b84d-802300431631:2:main",null,{}]],[],null,"main",1,[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",390],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",390]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":347,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":"b4b4910b-aae6-43d2-ae42-7d8c6a5df54e","length":12,"offset":0,"origin":"c332dae4-97b3-400a-b84d-802300431631:2:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":402,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":"overlapping "}]}],"openEnd":1,"openStart":1},"to":14,"kind":"delete"},[{"position":{"origin":"c332dae4-97b3-400a-b84d-802300431631:2:main","offset":0},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"c332dae4-97b3-400a-b84d-802300431631:2:boundary:[\\"main\\",\\"c332dae4-97b3-400a-b84d-802300431631:2:main\\",0]","offset":0,"length":2}]},{"position":{"origin":"c332dae4-97b3-400a-b84d-802300431631:2:main","offset":12},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"c332dae4-97b3-400a-b84d-802300431631:2:boundary:[\\"main\\",\\"c332dae4-97b3-400a-b84d-802300431631:2:main\\",12]","offset":0,"length":2}]}]]]]]',
            {
              digest:
                '9aeb753447d5db1a6f2635895b1fbeabba82751cb5743127ec329f8daf9e84c2',
              kind: 'insert',
              steps: [
                {
                  rootTargets: [],
                  targets: [
                    {
                      association: null,
                      from: {
                        left: {
                          offset: 390,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 390,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: 'b4b4910b-aae6-43d2-ae42-7d8c6a5df54e',
                          length: 12,
                          offset: 0,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:2:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 390,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 0,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:2:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 12,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:2:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      insertedContent: null,
                      retained: null,
                      boundaries: [
                        {
                          position: {
                            origin:
                              'c332dae4-97b3-400a-b84d-802300431631:2:main',
                            offset: 0,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                'c332dae4-97b3-400a-b84d-802300431631:2:boundary:["main","c332dae4-97b3-400a-b84d-802300431631:2:main",0]',
                              offset: 0,
                              length: 2,
                            },
                          ],
                        },
                        {
                          position: {
                            origin:
                              'c332dae4-97b3-400a-b84d-802300431631:2:main',
                            offset: 12,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                'c332dae4-97b3-400a-b84d-802300431631:2:boundary:["main","c332dae4-97b3-400a-b84d-802300431631:2:main",12]',
                              offset: 0,
                              length: 2,
                            },
                          ],
                        },
                      ],
                      length: 0,
                      properties: null,
                      textBoundary: null,
                    },
                  ],
                },
              ],
            },
            0,
          ],
          [
            0,
            'alice',
            '15384687-6df7-4250-8606-9d9b5382b35d',
            3,
            [],
            'c332dae4-97b3-400a-b84d-802300431631:3',
            null,
            ['c332dae4-97b3-400a-b84d-802300431631:2'],
            true,
            'c332dae4-97b3-400a-b84d-802300431631',
            [['c332dae4-97b3-400a-b84d-802300431631', 2]],
            3,
            1_791_079_347_961,
            'mixed',
            'd169568a37016b8e',
            '[[{"primary":[{"length":282},{"length":0,"replacement":[{"kind":"close","nodeKind":"text"},{"kind":"open","nodeKind":"text","props":{}}]},{"length":1820}],"version":3},[],[[null,[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282],["c332dae4-97b3-400a-b84d-802300431631:3:main",0]],[["c332dae4-97b3-400a-b84d-802300431631:3:main",2],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282]],[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282]],[["15384687-6df7-4250-8606-9d9b5382b35d",2,0,"c332dae4-97b3-400a-b84d-802300431631:3:main",null,{}]],[],null,"main",1,[["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":239,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":"15384687-6df7-4250-8606-9d9b5382b35d","length":2,"offset":0,"origin":"c332dae4-97b3-400a-b84d-802300431631:3:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":""},{"text":""}]}],"openEnd":1,"openStart":1},"to":4,"kind":"delete"}]]],[{"primary":[{"length":283},{"length":0,"replacement":[{"kind":"open","nodeKind":"element","props":{"type":"link","url":"/docs/suggestion"}},{"kind":"open","nodeKind":"text","props":{}},{"kind":"text","text":"suggestions"},{"kind":"close","nodeKind":"text"},{"kind":"close","nodeKind":"element"}]},{"length":1821}],"version":3},[],[[null,[["c332dae4-97b3-400a-b84d-802300431631:3:main",1],["c332dae4-97b3-400a-b84d-802300431631:3:main",2]],[["c332dae4-97b3-400a-b84d-802300431631:3:main",17],["c332dae4-97b3-400a-b84d-802300431631:3:main",1]],[["c332dae4-97b3-400a-b84d-802300431631:3:main",1],["c332dae4-97b3-400a-b84d-802300431631:3:main",1]],[["15384687-6df7-4250-8606-9d9b5382b35d",15,2,"c332dae4-97b3-400a-b84d-802300431631:3:main",null,{}]],[],null,"main",1,[["c332dae4-97b3-400a-b84d-802300431631:3:main",1],["c332dae4-97b3-400a-b84d-802300431631:3:main",1]],{"from":1,"spans":[{"birth":null,"length":1,"offset":238,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":"15384687-6df7-4250-8606-9d9b5382b35d","length":15,"offset":2,"origin":"c332dae4-97b3-400a-b84d-802300431631:3:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"type":"link","url":"/docs/suggestion","children":[{"text":"suggestions"}]}]}],"openEnd":1,"openStart":1},"to":16,"kind":"delete"}]]],[{"primary":[{"length":299},{"length":0,"replacement":[{"kind":"text","text":" like this added text"}]},{"length":1820}],"version":3},[],[[null,[["c332dae4-97b3-400a-b84d-802300431631:3:main",2],["c332dae4-97b3-400a-b84d-802300431631:3:main",17]],[["c332dae4-97b3-400a-b84d-802300431631:3:main",38],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282]],[["c332dae4-97b3-400a-b84d-802300431631:3:main",2],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282]],[["15384687-6df7-4250-8606-9d9b5382b35d",21,17,"c332dae4-97b3-400a-b84d-802300431631:3:main",null,{}]],[],null,"main",1,[["c332dae4-97b3-400a-b84d-802300431631:3:main",2],["eff4466d-e989-4ccc-834a-edde5c943219:base:main",282]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":"15384687-6df7-4250-8606-9d9b5382b35d","length":1,"offset":1,"origin":"c332dae4-97b3-400a-b84d-802300431631:3:main","placement":null,"properties":{}},{"birth":"15384687-6df7-4250-8606-9d9b5382b35d","length":21,"offset":17,"origin":"c332dae4-97b3-400a-b84d-802300431631:3:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"eff4466d-e989-4ccc-834a-edde5c943219:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":" like this added text"}]}],"openEnd":1,"openStart":1},"to":23,"kind":"delete"},[{"position":{"origin":"c332dae4-97b3-400a-b84d-802300431631:3:main","offset":17},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"c332dae4-97b3-400a-b84d-802300431631:3:boundary:[\\"main\\",\\"c332dae4-97b3-400a-b84d-802300431631:3:main\\",17]","offset":0,"length":2}]},{"position":{"origin":"c332dae4-97b3-400a-b84d-802300431631:3:main","offset":38},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"c332dae4-97b3-400a-b84d-802300431631:3:boundary:[\\"main\\",\\"c332dae4-97b3-400a-b84d-802300431631:3:main\\",38]","offset":0,"length":2}]}]]]]]',
            {
              digest:
                'd11f94784de9385260e58addacdf7651d6d26a159900cf882fb13cbf0b623ea1',
              kind: 'mixed',
              steps: [
                {
                  rootTargets: [],
                  targets: [
                    {
                      association: null,
                      from: {
                        left: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                          length: 2,
                          offset: 0,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        right: {
                          offset: 0,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 2,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      insertedContent: null,
                      retained: null,
                      length: 0,
                      properties: null,
                      textBoundary: {
                        position: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                        spans: [
                          {
                            birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                            length: 2,
                            offset: 0,
                            origin:
                              'c332dae4-97b3-400a-b84d-802300431631:3:main',
                            placement: null,
                            properties: {},
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  rootTargets: [],
                  targets: [
                    {
                      association: null,
                      from: {
                        left: {
                          offset: 1,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 1,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                          length: 15,
                          offset: 2,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 1,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 2,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 17,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                      },
                      insertedContent: null,
                      retained: null,
                      length: 0,
                      properties: null,
                      textBoundary: null,
                    },
                  ],
                },
                {
                  rootTargets: [],
                  targets: [
                    {
                      association: null,
                      from: {
                        left: {
                          offset: 2,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 2,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                          length: 21,
                          offset: 17,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 2,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 17,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 38,
                          origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                        },
                      },
                      insertedContent: null,
                      retained: null,
                      boundaries: [
                        {
                          position: {
                            origin:
                              'c332dae4-97b3-400a-b84d-802300431631:3:main',
                            offset: 17,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                'c332dae4-97b3-400a-b84d-802300431631:3:boundary:["main","c332dae4-97b3-400a-b84d-802300431631:3:main",17]',
                              offset: 0,
                              length: 2,
                            },
                          ],
                        },
                        {
                          position: {
                            origin:
                              'c332dae4-97b3-400a-b84d-802300431631:3:main',
                            offset: 38,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                'c332dae4-97b3-400a-b84d-802300431631:3:boundary:["main","c332dae4-97b3-400a-b84d-802300431631:3:main",38]',
                              offset: 0,
                              length: 2,
                            },
                          ],
                        },
                      ],
                      length: 0,
                      properties: null,
                      textBoundary: null,
                    },
                  ],
                },
              ],
            },
            0,
          ],
        ],
        projected: {
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
                  children: [
                    {
                      text: 'suggestions',
                    },
                  ],
                },
                {
                  text: ' like this added text or to . Discuss changes using ',
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
                  text: ' on many text segments. You can even have overlapping annotations!',
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
        },
        projectedPositions: [
          [
            'main',
            {
              birth: null,
              deleted: {
                count: 1,
                entries: [
                  [
                    'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                    {
                      count: 1,
                      entries: [
                        [
                          '0000000000000289',
                          {
                            length: 21,
                            position: {
                              left: {
                                offset: 289,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                              },
                              right: {
                                offset: 310,
                                origin:
                                  'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                              },
                            },
                          },
                        ],
                      ],
                      first: '0000000000000289',
                      height: 1,
                      kind: 'leaf',
                    },
                  ],
                ],
                first: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                height: 1,
                kind: 'leaf',
              },
              present: true,
              spans: [
                {
                  birth: null,
                  length: 282,
                  offset: 0,
                  origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                  length: 1,
                  offset: 0,
                  origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                  length: 15,
                  offset: 2,
                  origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                  length: 1,
                  offset: 1,
                  origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '15384687-6df7-4250-8606-9d9b5382b35d',
                  length: 21,
                  offset: 17,
                  origin: 'c332dae4-97b3-400a-b84d-802300431631:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 7,
                  offset: 282,
                  origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 80,
                  offset: 310,
                  origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: 'b4b4910b-aae6-43d2-ae42-7d8c6a5df54e',
                  length: 12,
                  offset: 0,
                  origin: 'c332dae4-97b3-400a-b84d-802300431631:2:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 1721,
                  offset: 390,
                  origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                  placement: null,
                  properties: {},
                },
              ],
            },
          ],
        ],
      },
      version: 7,
    },
  },
};

export const richTextEditorComments: CommentsJSON = {
  kind: 'plate-comments',
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
        id: 'b4b4910b-aae6-43d2-ae42-7d8c6a5df54e',
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
          root: 'main',
          range: null,
          authored: {
            anchor: {
              left: {
                offset: 337,
                origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
              },
              right: {
                offset: 337,
                origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
              },
            },
            content: [
              {
                origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
                offset: 337,
                length: 33,
              },
            ],
            documentId: 'eff4466d-e989-4ccc-834a-edde5c943219',
            direction: 'forward',
            focus: {
              left: {
                offset: 370,
                origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
              },
              right: {
                offset: 370,
                origin: 'eff4466d-e989-4ccc-834a-edde5c943219:base:main',
              },
            },
            root: 'main',
          },
        },
      },
    },
  ],
};
