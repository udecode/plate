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
                  origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
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
            1_789_665_010_655,
            [],
            ['46698e02-343b-4124-b006-04f709d55cf9:3'],
            '1935a2f6-3721-419c-a60c-210ad906cf1e',
            'mixed',
            ['46698e02-343b-4124-b006-04f709d55cf9:3'],
            [],
            1,
            'pending',
            1_789_665_010_655,
          ],
          [
            'charlie',
            1_789_665_010_644,
            [],
            ['46698e02-343b-4124-b006-04f709d55cf9:2'],
            '69612039-53dc-49cc-8ff5-ee6de67c11e3',
            'insert',
            ['46698e02-343b-4124-b006-04f709d55cf9:2'],
            [],
            1,
            'pending',
            1_789_665_010_644,
          ],
          [
            'bob',
            1_789_665_010_637,
            [],
            ['46698e02-343b-4124-b006-04f709d55cf9:1'],
            'ca8cfc79-f4b8-4c28-ad0d-9bb59ac7949f',
            'delete',
            ['46698e02-343b-4124-b006-04f709d55cf9:1'],
            [],
            1,
            'pending',
            1_789_665_010_637,
          ],
        ],
        documentId: '488acfe8-fd98-49a6-82d5-b70b69cf98fb',
        operations: [
          [
            0,
            'bob',
            'ca8cfc79-f4b8-4c28-ad0d-9bb59ac7949f',
            1,
            [],
            '46698e02-343b-4124-b006-04f709d55cf9:1',
            null,
            [],
            true,
            '46698e02-343b-4124-b006-04f709d55cf9',
            [],
            1,
            1_789_665_010_637,
            'delete',
            '4642e15ef79b1a6a',
            '[[{"primary":[{"length":289},{"length":21,"replacement":[]},{"length":1801}],"version":3},[],[[null,[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",289],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",310]],[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",289],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",310]],[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",289],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",289]],[],[[null,21,289,"488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",null,{}]],{"from":2,"kind":"delete","slice":{"content":[{"type":"paragraph","children":[{"text":"mark text for removal"}]}],"openEnd":1,"openStart":1},"spans":[{"birth":null,"length":1,"offset":238,"origin":"488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":239,"origin":"488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main","placement":null,"properties":{}},{"birth":null,"length":21,"offset":289,"origin":"488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main","placement":null,"properties":{}}],"to":23},"main",1,[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",310],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",310]]]]]]',
            {
              digest:
                'dea1730f015ddc7d8536d8ce724dd2bd5f86df8bf36fc8c15c14398903eb0bd5',
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
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 289,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 310,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
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
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      inserted: [],
                      afterFrom: {
                        left: {
                          offset: 289,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 289,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      retained: null,
                      length: 21,
                      properties: null,
                      textBoundary: null,
                    },
                  ],
                },
              ],
            },
          ],
          [
            0,
            'charlie',
            '69612039-53dc-49cc-8ff5-ee6de67c11e3',
            2,
            [],
            '46698e02-343b-4124-b006-04f709d55cf9:2',
            null,
            ['46698e02-343b-4124-b006-04f709d55cf9:1'],
            true,
            '46698e02-343b-4124-b006-04f709d55cf9',
            [['46698e02-343b-4124-b006-04f709d55cf9', 1]],
            2,
            1_789_665_010_644,
            'insert',
            'cc319607af1ba9d3',
            '[[{"primary":[{"length":369},{"length":0,"replacement":[{"kind":"text","text":"overlapping "}]},{"length":1721}],"version":3},[],[[null,[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",390],["46698e02-343b-4124-b006-04f709d55cf9:2:main",0]],[["46698e02-343b-4124-b006-04f709d55cf9:2:main",12],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",390]],[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",390],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",390]],[["69612039-53dc-49cc-8ff5-ee6de67c11e3",12,0,"46698e02-343b-4124-b006-04f709d55cf9:2:main",null,{}]],[],null,"main",1,[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",390],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",390]]]]]]',
            {
              digest:
                '484d072810783cf6ff13776e5bbf2523d13c907ef256f612bc7b5b81b59b5e36',
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
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 390,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '69612039-53dc-49cc-8ff5-ee6de67c11e3',
                          length: 12,
                          offset: 0,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:2:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 390,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 0,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:2:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 12,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:2:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      retained: null,
                      length: 0,
                      properties: null,
                      textBoundary: null,
                    },
                  ],
                },
              ],
            },
          ],
          [
            0,
            'alice',
            '1935a2f6-3721-419c-a60c-210ad906cf1e',
            3,
            [],
            '46698e02-343b-4124-b006-04f709d55cf9:3',
            null,
            ['46698e02-343b-4124-b006-04f709d55cf9:2'],
            true,
            '46698e02-343b-4124-b006-04f709d55cf9',
            [['46698e02-343b-4124-b006-04f709d55cf9', 2]],
            3,
            1_789_665_010_655,
            'mixed',
            '37b918d5c6a70919',
            '[[{"primary":[{"length":282},{"length":0,"replacement":[{"kind":"close","nodeKind":"text"},{"kind":"open","nodeKind":"text","props":{}}]},{"length":1820}],"version":3},[],[[null,[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282],["46698e02-343b-4124-b006-04f709d55cf9:3:main",0]],[["46698e02-343b-4124-b006-04f709d55cf9:3:main",2],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282]],[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282]],[["1935a2f6-3721-419c-a60c-210ad906cf1e",2,0,"46698e02-343b-4124-b006-04f709d55cf9:3:main",null,{}]],[],null,"main",1,[["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282]]]]],[{"primary":[{"length":283},{"length":0,"replacement":[{"kind":"open","nodeKind":"element","props":{"type":"link","url":"/docs/suggestion"}},{"kind":"open","nodeKind":"text","props":{}},{"kind":"text","text":"suggestions"},{"kind":"close","nodeKind":"text"},{"kind":"close","nodeKind":"element"}]},{"length":1821}],"version":3},[],[[null,[["46698e02-343b-4124-b006-04f709d55cf9:3:main",1],["46698e02-343b-4124-b006-04f709d55cf9:3:main",2]],[["46698e02-343b-4124-b006-04f709d55cf9:3:main",17],["46698e02-343b-4124-b006-04f709d55cf9:3:main",1]],[["46698e02-343b-4124-b006-04f709d55cf9:3:main",1],["46698e02-343b-4124-b006-04f709d55cf9:3:main",1]],[["1935a2f6-3721-419c-a60c-210ad906cf1e",15,2,"46698e02-343b-4124-b006-04f709d55cf9:3:main",null,{}]],[],null,"main",1,[["46698e02-343b-4124-b006-04f709d55cf9:3:main",1],["46698e02-343b-4124-b006-04f709d55cf9:3:main",1]]]]],[{"primary":[{"length":299},{"length":0,"replacement":[{"kind":"text","text":" like this added text"}]},{"length":1820}],"version":3},[],[[null,[["46698e02-343b-4124-b006-04f709d55cf9:3:main",2],["46698e02-343b-4124-b006-04f709d55cf9:3:main",17]],[["46698e02-343b-4124-b006-04f709d55cf9:3:main",38],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282]],[["46698e02-343b-4124-b006-04f709d55cf9:3:main",2],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282]],[["1935a2f6-3721-419c-a60c-210ad906cf1e",21,17,"46698e02-343b-4124-b006-04f709d55cf9:3:main",null,{}]],[],null,"main",1,[["46698e02-343b-4124-b006-04f709d55cf9:3:main",2],["488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main",282]]]]]]',
            {
              digest:
                '2e3c6ce4583f5f377576756488dcf61050482bec249c7af756ae4d9283408311',
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
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                          length: 2,
                          offset: 0,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        right: {
                          offset: 0,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 2,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      retained: null,
                      length: 0,
                      properties: null,
                      textBoundary: {
                        position: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                        spans: [
                          {
                            birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                            length: 2,
                            offset: 0,
                            origin:
                              '46698e02-343b-4124-b006-04f709d55cf9:3:main',
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
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 1,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                          length: 15,
                          offset: 2,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 1,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 2,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 17,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                      },
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
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 2,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                          length: 21,
                          offset: 17,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 2,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 17,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 38,
                          origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                        },
                      },
                      retained: null,
                      length: 0,
                      properties: null,
                      textBoundary: null,
                    },
                  ],
                },
              ],
            },
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
                    '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
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
                                  '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                              },
                              right: {
                                offset: 310,
                                origin:
                                  '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
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
                first: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                height: 1,
                kind: 'leaf',
              },
              present: true,
              spans: [
                {
                  birth: null,
                  length: 282,
                  offset: 0,
                  origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                  length: 1,
                  offset: 0,
                  origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                  length: 15,
                  offset: 2,
                  origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                  length: 1,
                  offset: 1,
                  origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '1935a2f6-3721-419c-a60c-210ad906cf1e',
                  length: 21,
                  offset: 17,
                  origin: '46698e02-343b-4124-b006-04f709d55cf9:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 7,
                  offset: 282,
                  origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 80,
                  offset: 310,
                  origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '69612039-53dc-49cc-8ff5-ee6de67c11e3',
                  length: 12,
                  offset: 0,
                  origin: '46698e02-343b-4124-b006-04f709d55cf9:2:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 1721,
                  offset: 390,
                  origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                  placement: null,
                  properties: {},
                },
              ],
            },
          ],
        ],
      },
      version: 6,
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
        id: '69612039-53dc-49cc-8ff5-ee6de67c11e3',
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
                origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
              },
              right: {
                offset: 337,
                origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
              },
            },
            content: [
              {
                origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
                offset: 337,
                length: 33,
              },
            ],
            documentId: '488acfe8-fd98-49a6-82d5-b70b69cf98fb',
            direction: 'forward',
            focus: {
              left: {
                offset: 370,
                origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
              },
              right: {
                offset: 370,
                origin: '488acfe8-fd98-49a6-82d5-b70b69cf98fb:base:main',
              },
            },
            root: 'main',
          },
        },
      },
    },
  ],
};
