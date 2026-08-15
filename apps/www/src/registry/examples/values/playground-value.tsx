import type { EditorDocumentValue } from 'platejs';

export const playgroundValue: EditorDocumentValue = {
  children: [
    // Intro
    {
      children: [{ text: 'Welcome to the Plate Playground!' }],
      type: 'h1',
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
      type: 'h2',
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
                createdAt: Date.now(),
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
            createdAt: Date.now(),
            type: 'insert',
            userId: 'alice',
          },
          text: ' ',
        },
        {
          suggestion: true,
          suggestion_playground1: {
            id: 'playground1',
            createdAt: Date.now(),
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
            createdAt: Date.now(),
            type: 'remove',
            userId: 'bob',
          },
          text: 'mark text for removal',
        },
        { text: '. Discuss changes using ' },
        {
          children: [
            { comment: true, comment_discussion1: true, text: 'comments' },
          ],
          type: 'link',
          url: '/docs/comment',
        },
        {
          comment: true,
          comment_discussion1: true,
          text: ' on many text segments',
        },
        { text: '. You can even have ' },
        {
          comment: true,
          comment_discussion2: true,
          suggestion: true,
          suggestion_playground3: {
            id: 'playground3',
            createdAt: Date.now(),
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
      type: 'h2',
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
      listStyleType: 'disc',
      type: 'paragraph',
    },
    {
      children: [
        { text: 'Edit existing text (improve, fix grammar, change tone)' },
      ],
      indent: 1,
      listStyleType: 'disc',
      type: 'paragraph',
    },
    // Core Features Section (Combined)
    {
      children: [{ text: 'Rich Content Editing' }],
      type: 'h2',
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
          listStyleType: 'disc',
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
        { children: [{ text: 'function hello() {' }], type: 'codeLine' },
        {
          children: [{ text: "  console.info('Code blocks are supported!');" }],
          type: 'codeLine',
        },
        { children: [{ text: '}' }], type: 'codeLine' },
      ],
      lang: 'javascript',
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
        { children: [{ text: '' }], type: 'mention', value: 'Alice' },
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
      type: 'h3',
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

      colSizes: [160, 170, 200],
      type: 'table',
    },
    // Media Section
    {
      children: [{ text: 'Images and Media' }],
      type: 'h3',
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
      isUpload: true,
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
      type: 'h3',
    },
    {
      children: [{ text: '' }],
      type: 'toc',
    },
    // Horizontal Rule
    {
      children: [{ text: '' }],
      type: 'horizontalRule',
    },
    // Date
    {
      children: [{ text: 'Dates and Equations' }],
      type: 'h3',
    },
    {
      children: [
        { text: 'Insert dates like ' },
        { children: [{ text: '' }], date: '2024-01-15', type: 'date' },
        { text: ' or use inline equations: ' },
        {
          children: [{ text: '' }],
          texExpression: 'E = mc^2',
          type: 'inlineEquation',
        },
        { text: '.' },
      ],
      type: 'paragraph',
    },
    // Block Equation
    {
      children: [{ text: '' }],
      texExpression: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
      type: 'equation',
    },
    // Callout
    {
      children: [{ text: 'Callouts and Toggles' }],
      type: 'h3',
    },
    {
      children: [
        { text: 'This is a callout block for important information.' },
      ],
      icon: '💡',
      type: 'callout',
      variant: 'info',
    },
    // Columns
    {
      children: [{ text: 'Multi-column Layout' }],
      type: 'h3',
    },
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  text: 'First column content. Great for side-by-side comparisons.',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'column',
          width: '50%',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'Second column content. Layout flexibility at its best.',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'column',
          width: '50%',
        },
      ],
      type: 'columnGroup',
    },
    {
      children: [{ text: '' }],
      type: 'paragraph',
    },
    {
      children: [
        {
          text: '',
        },
      ],
      data: {
        drawingMode: 'Both',
        drawingType: 'Mermaid',
        code: `classDiagram
      Animal <|-- Duck
      Animal <|-- Fish
      Animal <|-- Zebra
      Animal : +int age
      Animal : +String gender
      Animal: +isMammal()
      Animal: +mate()
      class Duck{
        +String beakColor
        +swim()
        +quack()
      }
      class Fish{
        -int sizeInFeet
        -canEat()
      }
      class Zebra{
        +bool is_wild
        +run()
      } 
      `,
      },
      type: 'codeDrawing',
    },
  ],
};
