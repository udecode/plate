import type { EditorDocumentValue } from 'platejs';
import type { CommentThread } from 'platejs/comments';

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
                  origin: '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
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
            1_789_411_213_209,
            [],
            ['31501029-8941-40db-b3db-3b4cb9954e84:2'],
            '31632a17-2bd0-4bc9-803d-29b5189774d9',
            'insert',
            ['31501029-8941-40db-b3db-3b4cb9954e84:2'],
            [],
            1,
            'pending',
            1_789_411_213_209,
          ],
          [
            'bob',
            1_789_411_213_174,
            [],
            ['31501029-8941-40db-b3db-3b4cb9954e84:1'],
            '9adf5a63-7ee4-491c-b7ac-0f8d0e797a60',
            'delete',
            ['31501029-8941-40db-b3db-3b4cb9954e84:1'],
            [],
            1,
            'pending',
            1_789_411_213_174,
          ],
          [
            'alice',
            1_789_411_213_237,
            [],
            ['31501029-8941-40db-b3db-3b4cb9954e84:3'],
            'b4566937-7869-469e-b51c-fcbcd3f74a0d',
            'mixed',
            ['31501029-8941-40db-b3db-3b4cb9954e84:3'],
            [],
            1,
            'pending',
            1_789_411_213_237,
          ],
        ],
        documentId: '12ee2a5d-02bc-470d-82c3-ff21534aa192',
        operations: [
          [
            0,
            'bob',
            '9adf5a63-7ee4-491c-b7ac-0f8d0e797a60',
            1,
            [],
            '31501029-8941-40db-b3db-3b4cb9954e84:1',
            null,
            [],
            true,
            '31501029-8941-40db-b3db-3b4cb9954e84',
            [],
            1,
            1_789_411_213_174,
            'delete',
            '6a8f7ea0e801b424',
            '[[{"primary":[{"length":289},{"length":21,"replacement":[]},{"length":1801}],"version":3},[],[[null,[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",289],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",310]],[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",289],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",310]],[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",289],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",289]],[],[[null,21,289,"12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",null,{}]],{"from":2,"kind":"delete","slice":{"content":[{"type":"paragraph","children":[{"text":"mark text for removal"}]}],"openEnd":1,"openStart":1},"spans":[{"birth":null,"length":1,"offset":238,"origin":"12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":239,"origin":"12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main","placement":null,"properties":{}},{"birth":null,"length":21,"offset":289,"origin":"12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":334,"origin":"12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main","placement":null,"properties":{}},{"birth":null,"length":1,"offset":403,"origin":"12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main","placement":null,"properties":{}}],"to":23},"main",1,[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",310],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",310]]]]]]',
          ],
          [
            0,
            'charlie',
            '31632a17-2bd0-4bc9-803d-29b5189774d9',
            2,
            [],
            '31501029-8941-40db-b3db-3b4cb9954e84:2',
            null,
            ['31501029-8941-40db-b3db-3b4cb9954e84:1'],
            true,
            '31501029-8941-40db-b3db-3b4cb9954e84',
            [['31501029-8941-40db-b3db-3b4cb9954e84', 1]],
            2,
            1_789_411_213_209,
            'insert',
            '86e6de48c360a734',
            '[[{"primary":[{"length":369},{"length":0,"replacement":[{"kind":"text","text":"overlapping "}]},{"length":1721}],"version":3},[],[[null,[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",390],["31501029-8941-40db-b3db-3b4cb9954e84:2:main",0]],[["31501029-8941-40db-b3db-3b4cb9954e84:2:main",12],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",390]],[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",390],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",390]],[["31632a17-2bd0-4bc9-803d-29b5189774d9",12,0,"31501029-8941-40db-b3db-3b4cb9954e84:2:main",null,{}]],[],null,"main",1,[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",390],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",390]]]]]]',
          ],
          [
            0,
            'alice',
            'b4566937-7869-469e-b51c-fcbcd3f74a0d',
            3,
            [],
            '31501029-8941-40db-b3db-3b4cb9954e84:3',
            null,
            ['31501029-8941-40db-b3db-3b4cb9954e84:2'],
            true,
            '31501029-8941-40db-b3db-3b4cb9954e84',
            [['31501029-8941-40db-b3db-3b4cb9954e84', 2]],
            3,
            1_789_411_213_237,
            'mixed',
            '4288f6a5320dab71',
            '[[{"primary":[{"length":282},{"length":0,"replacement":[{"kind":"close","nodeKind":"text"},{"kind":"open","nodeKind":"text","props":{}}]},{"length":1820}],"version":3},[],[[null,[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282],["31501029-8941-40db-b3db-3b4cb9954e84:3:main",0]],[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",2],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282]],[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282]],[["b4566937-7869-469e-b51c-fcbcd3f74a0d",2,0,"31501029-8941-40db-b3db-3b4cb9954e84:3:main",null,{}]],[],null,"main",1,[["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282]]]]],[{"primary":[{"length":283},{"length":0,"replacement":[{"kind":"open","nodeKind":"element","props":{"type":"link","url":"/docs/suggestion"}},{"kind":"open","nodeKind":"text","props":{}},{"kind":"text","text":"suggestions"},{"kind":"close","nodeKind":"text"},{"kind":"close","nodeKind":"element"}]},{"length":1821}],"version":3},[],[[null,[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",1],["31501029-8941-40db-b3db-3b4cb9954e84:3:main",2]],[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",17],["31501029-8941-40db-b3db-3b4cb9954e84:3:main",1]],[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",1],["31501029-8941-40db-b3db-3b4cb9954e84:3:main",1]],[["b4566937-7869-469e-b51c-fcbcd3f74a0d",15,2,"31501029-8941-40db-b3db-3b4cb9954e84:3:main",null,{}]],[],null,"main",1,[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",1],["31501029-8941-40db-b3db-3b4cb9954e84:3:main",1]]]]],[{"primary":[{"length":299},{"length":0,"replacement":[{"kind":"text","text":" like this added text"}]},{"length":1820}],"version":3},[],[[null,[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",2],["31501029-8941-40db-b3db-3b4cb9954e84:3:main",17]],[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",38],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282]],[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",2],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282]],[["b4566937-7869-469e-b51c-fcbcd3f74a0d",21,17,"31501029-8941-40db-b3db-3b4cb9954e84:3:main",null,{}]],[],null,"main",1,[["31501029-8941-40db-b3db-3b4cb9954e84:3:main",2],["12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main",282]]]]]]',
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
                    '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
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
                                  '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
                              },
                              right: {
                                offset: 310,
                                origin:
                                  '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
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
                first: '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
                height: 1,
                kind: 'leaf',
              },
              present: true,
              spans: [
                {
                  birth: null,
                  length: 282,
                  offset: 0,
                  origin: '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: 'b4566937-7869-469e-b51c-fcbcd3f74a0d',
                  length: 1,
                  offset: 0,
                  origin: '31501029-8941-40db-b3db-3b4cb9954e84:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: 'b4566937-7869-469e-b51c-fcbcd3f74a0d',
                  length: 15,
                  offset: 2,
                  origin: '31501029-8941-40db-b3db-3b4cb9954e84:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: 'b4566937-7869-469e-b51c-fcbcd3f74a0d',
                  length: 1,
                  offset: 1,
                  origin: '31501029-8941-40db-b3db-3b4cb9954e84:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: 'b4566937-7869-469e-b51c-fcbcd3f74a0d',
                  length: 21,
                  offset: 17,
                  origin: '31501029-8941-40db-b3db-3b4cb9954e84:3:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 7,
                  offset: 282,
                  origin: '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 80,
                  offset: 310,
                  origin: '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: '31632a17-2bd0-4bc9-803d-29b5189774d9',
                  length: 12,
                  offset: 0,
                  origin: '31501029-8941-40db-b3db-3b4cb9954e84:2:main',
                  placement: null,
                  properties: {},
                },
                {
                  birth: null,
                  length: 1721,
                  offset: 390,
                  origin: '12ee2a5d-02bc-470d-82c3-ff21534aa192:base:main',
                  placement: null,
                  properties: {},
                },
              ],
            },
          ],
        ],
      },
      version: 5,
    },
  },
};

export const richTextEditorThreads: CommentThread[] = [
  {
    id: 'discussion1',
    createdAt: '2026-09-14T18:18:51.315Z',
    resolved: false,
    status: 'published',
    excerpt: 'comments',
    userId: 'charlie',
    target: {
      type: 'range',
      range: {
        anchor: {
          path: [3, 1, 0],
          offset: 0,
        },
        focus: {
          path: [3, 2],
          offset: 22,
        },
      },
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
  },
  {
    id: 'discussion2',
    createdAt: '2026-09-14T18:23:51.315Z',
    resolved: false,
    status: 'published',
    excerpt: 'overlapping',
    userId: 'bob',
    target: {
      id: '31632a17-2bd0-4bc9-803d-29b5189774d9',
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
  },
];
