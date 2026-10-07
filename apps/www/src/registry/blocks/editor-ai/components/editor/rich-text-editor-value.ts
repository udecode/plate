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
                  origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                  placement: null,
                  properties: {},
                },
              ],
            },
          ],
        ],
        changes: [
          [
            'charlie',
            1_791_310_423_605,
            [],
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:2'],
            '1889ed9a-328c-4fbc-9add-73c1a7e71a08',
            'insert',
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:2'],
            [],
            1,
            'pending',
            1_791_310_423_605,
          ],
          [
            'alice',
            1_791_310_423_619,
            [],
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:3'],
            '4b0f5712-6a26-4c64-bd63-59e4af502130',
            'mixed',
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:3'],
            [],
            1,
            'pending',
            1_791_310_423_619,
          ],
          [
            'bob',
            1_791_310_423_596,
            [],
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:1'],
            'fc2b6f1f-3e68-44ab-8030-ea3e480153be',
            'delete',
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:1'],
            [],
            1,
            'pending',
            1_791_310_423_596,
          ],
        ],
        documentId: '243e05e4-c307-45e5-8c2a-a318fa7c15eb',
        operations: [
          [
            0,
            'bob',
            'fc2b6f1f-3e68-44ab-8030-ea3e480153be',
            1,
            [],
            '99f5eb44-f330-4490-90a1-b9f65af6c701:1',
            null,
            [],
            true,
            '99f5eb44-f330-4490-90a1-b9f65af6c701',
            [],
            1,
            1_791_310_423_596,
            'delete',
            '9bbce6894ce4bc75',
            '[[{"primary":[{"length":289},{"length":21,"replacement":[]},{"length":1801}],"version":3},[],[[null,[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",289],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",310]],[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",289],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",310]],[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",289],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",289]],[],[[null,21,289,"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",null,{}]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":239,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":21,"offset":289,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":"mark text for removal"}]}],"openEnd":1,"openStart":1},"to":23,"kind":"delete"},"main",1,[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",310],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",310]],null]]]]',
            {
              digest:
                'a31f56655fa52a3a73d0d4cbae34bac3ae4e534a7f684f40a73b327b8b552737',
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
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 289,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 310,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
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
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      inserted: [],
                      afterFrom: {
                        left: {
                          offset: 289,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 289,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 310,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
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
            '1889ed9a-328c-4fbc-9add-73c1a7e71a08',
            2,
            [],
            '99f5eb44-f330-4490-90a1-b9f65af6c701:2',
            null,
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:1'],
            true,
            '99f5eb44-f330-4490-90a1-b9f65af6c701',
            [['99f5eb44-f330-4490-90a1-b9f65af6c701', 1]],
            2,
            1_791_310_423_605,
            'insert',
            '0c191a5848b3e97c',
            '[[{"primary":[{"length":369},{"length":0,"replacement":[{"kind":"text","text":"overlapping "}]},{"length":1721}],"version":3},[],[[null,[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",390],["99f5eb44-f330-4490-90a1-b9f65af6c701:2:main",0]],[["99f5eb44-f330-4490-90a1-b9f65af6c701:2:main",12],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",390]],[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",390],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",390]],[["1889ed9a-328c-4fbc-9add-73c1a7e71a08",12,0,"99f5eb44-f330-4490-90a1-b9f65af6c701:2:main",null,{}]],[],null,"main",1,[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",390],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",390]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":347,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":"1889ed9a-328c-4fbc-9add-73c1a7e71a08","length":12,"offset":0,"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:2:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":402,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":"overlapping "}]}],"openEnd":1,"openStart":1},"to":14,"kind":"delete"},[{"position":{"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:2:main","offset":0},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:2:boundary:[\\"main\\",\\"99f5eb44-f330-4490-90a1-b9f65af6c701:2:main\\",0]","offset":0,"length":2}]},{"position":{"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:2:main","offset":12},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:2:boundary:[\\"main\\",\\"99f5eb44-f330-4490-90a1-b9f65af6c701:2:main\\",12]","offset":0,"length":2}]}]]]]]',
            {
              digest:
                'ed4b6e4935719754b3d10927855564da0a9bd9f4132a5b3b0cea2ce41192a812',
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
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 390,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '1889ed9a-328c-4fbc-9add-73c1a7e71a08',
                          length: 12,
                          offset: 0,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:2:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 390,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 0,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:2:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 12,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:2:main',
                        },
                        right: {
                          offset: 390,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      insertedContent: null,
                      retained: null,
                      boundaries: [
                        {
                          position: {
                            origin:
                              '99f5eb44-f330-4490-90a1-b9f65af6c701:2:main',
                            offset: 0,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                '99f5eb44-f330-4490-90a1-b9f65af6c701:2:boundary:["main","99f5eb44-f330-4490-90a1-b9f65af6c701:2:main",0]',
                              offset: 0,
                              length: 2,
                            },
                          ],
                        },
                        {
                          position: {
                            origin:
                              '99f5eb44-f330-4490-90a1-b9f65af6c701:2:main',
                            offset: 12,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                '99f5eb44-f330-4490-90a1-b9f65af6c701:2:boundary:["main","99f5eb44-f330-4490-90a1-b9f65af6c701:2:main",12]',
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
            '4b0f5712-6a26-4c64-bd63-59e4af502130',
            3,
            [],
            '99f5eb44-f330-4490-90a1-b9f65af6c701:3',
            null,
            ['99f5eb44-f330-4490-90a1-b9f65af6c701:2'],
            true,
            '99f5eb44-f330-4490-90a1-b9f65af6c701',
            [['99f5eb44-f330-4490-90a1-b9f65af6c701', 2]],
            3,
            1_791_310_423_619,
            'mixed',
            '439f886782c53d73',
            '[[{"primary":[{"length":282},{"length":0,"replacement":[{"kind":"close","nodeKind":"text"},{"kind":"open","nodeKind":"text","props":{}}]},{"length":1820}],"version":3},[],[[null,[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282],["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",0]],[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",2],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282]],[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282]],[["4b0f5712-6a26-4c64-bd63-59e4af502130",2,0,"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",null,{}]],[],null,"main",1,[["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":239,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":"4b0f5712-6a26-4c64-bd63-59e4af502130","length":2,"offset":0,"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":""},{"text":""}]}],"openEnd":1,"openStart":1},"to":4,"kind":"delete"}]]],[{"primary":[{"length":283},{"length":0,"replacement":[{"kind":"open","nodeKind":"element","props":{"type":"link","url":"/docs/suggestion"}},{"kind":"open","nodeKind":"text","props":{}},{"kind":"text","text":"suggestions"},{"kind":"close","nodeKind":"text"},{"kind":"close","nodeKind":"element"}]},{"length":1821}],"version":3},[],[[null,[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",1],["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",2]],[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",17],["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",1]],[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",1],["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",1]],[["4b0f5712-6a26-4c64-bd63-59e4af502130",15,2,"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",null,{}]],[],null,"main",1,[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",1],["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",1]],{"from":1,"spans":[{"birth":null,"length":1,"offset":238,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":"4b0f5712-6a26-4c64-bd63-59e4af502130","length":15,"offset":2,"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"type":"link","url":"/docs/suggestion","children":[{"text":"suggestions"}]}]}],"openEnd":1,"openStart":1},"to":16,"kind":"delete"}]]],[{"primary":[{"length":299},{"length":0,"replacement":[{"kind":"text","text":" like this added text"}]},{"length":1820}],"version":3},[],[[null,[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",2],["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",17]],[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",38],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282]],[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",2],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282]],[["4b0f5712-6a26-4c64-bd63-59e4af502130",21,17,"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",null,{}]],[],null,"main",1,[["99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",2],["243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main",282]],{"from":2,"spans":[{"birth":null,"length":1,"offset":238,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":"4b0f5712-6a26-4c64-bd63-59e4af502130","length":1,"offset":1,"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main","placement":null,"properties":{}},{"birth":"4b0f5712-6a26-4c64-bd63-59e4af502130","length":21,"offset":17,"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main","placement":null,"properties":{}}],"slice":{"content":[{"type":"paragraph","children":[{"text":" like this added text"}]}],"openEnd":1,"openStart":1},"to":23,"kind":"delete"},[{"position":{"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main","offset":17},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:boundary:[\\"main\\",\\"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main\\",17]","offset":0,"length":2}]},{"position":{"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main","offset":38},"spans":[{"birth":null,"placement":null,"properties":{},"origin":"99f5eb44-f330-4490-90a1-b9f65af6c701:3:boundary:[\\"main\\",\\"99f5eb44-f330-4490-90a1-b9f65af6c701:3:main\\",38]","offset":0,"length":2}]}]]]]]',
            {
              digest:
                '0ea421de9e5f7f4619ccbf3aef33be92d53754c02a78a6633c2ff1bbea6b247d',
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
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                          length: 2,
                          offset: 0,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        right: {
                          offset: 0,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 2,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
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
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                        spans: [
                          {
                            birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                            length: 2,
                            offset: 0,
                            origin:
                              '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
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
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 1,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                          length: 15,
                          offset: 2,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 1,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 2,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 17,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 1,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
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
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      to: {
                        left: {
                          offset: 2,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      root: 'main',
                      section: 1,
                      removed: [],
                      inserted: [
                        {
                          birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                          length: 21,
                          offset: 17,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                          placement: null,
                          properties: {},
                        },
                      ],
                      afterFrom: {
                        left: {
                          offset: 2,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 17,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                      },
                      afterTo: {
                        left: {
                          offset: 38,
                          origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                        },
                        right: {
                          offset: 282,
                          origin:
                            '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                        },
                      },
                      insertedContent: null,
                      retained: null,
                      boundaries: [
                        {
                          position: {
                            origin:
                              '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                            offset: 17,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                '99f5eb44-f330-4490-90a1-b9f65af6c701:3:boundary:["main","99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",17]',
                              offset: 0,
                              length: 2,
                            },
                          ],
                        },
                        {
                          position: {
                            origin:
                              '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                            offset: 38,
                          },
                          spans: [
                            {
                              birth: null,
                              placement: null,
                              properties: {},
                              origin:
                                '99f5eb44-f330-4490-90a1-b9f65af6c701:3:boundary:["main","99f5eb44-f330-4490-90a1-b9f65af6c701:3:main",38]',
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
                    '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
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
                                  '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                              },
                              right: {
                                offset: 310,
                                origin:
                                  '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
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
                first: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                height: 1,
                kind: 'leaf',
              },
              present: true,
              spans: [
                {
                  birth: null,
                  length: 282,
                  offset: 0,
                  origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                  length: 1,
                  offset: 0,
                  origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                  length: 15,
                  offset: 2,
                  origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                  length: 1,
                  offset: 1,
                  origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '4b0f5712-6a26-4c64-bd63-59e4af502130',
                  length: 21,
                  offset: 17,
                  origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 7,
                  offset: 282,
                  origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 80,
                  offset: 310,
                  origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '1889ed9a-328c-4fbc-9add-73c1a7e71a08',
                  length: 12,
                  offset: 0,
                  origin: '99f5eb44-f330-4490-90a1-b9f65af6c701:2:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 1721,
                  offset: 390,
                  origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
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
        id: '1889ed9a-328c-4fbc-9add-73c1a7e71a08',
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
                origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
              },
              right: {
                offset: 337,
                origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
              },
            },
            content: [
              {
                origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
                offset: 337,
                length: 33,
              },
            ],
            documentId: '243e05e4-c307-45e5-8c2a-a318fa7c15eb',
            direction: 'forward',
            focus: {
              left: {
                offset: 370,
                origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
              },
              right: {
                offset: 370,
                origin: '243e05e4-c307-45e5-8c2a-a318fa7c15eb:base:main',
              },
            },
            root: 'main',
          },
        },
      },
    },
  ],
};
