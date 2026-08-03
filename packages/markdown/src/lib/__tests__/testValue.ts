export const testValue = [
  {
    type: 'h1',
    children: [
      {
        text: 'Playground',
      },
    ],
  },
  {
    type: 'h2',
    children: [
      {
        text: 'Comments and suggestions',
      },
    ],
  },
  {
    children: [
      {
        text: 'Add ',
      },
      {
        comment: true,
        comment_discussion1: true,
        text: 'comments to your content',
      },
      {
        text: ' to provide additional conte1xt, ',
      },
      {
        suggestion: true,
        suggestion_suggestion1: {
          id: 'suggestion1',
          createdAt: 1_742_652_370_104,
          type: 'remove',
          userId: 'charlie',
        },
        text: 'insights',
      },
      {
        suggestion: true,
        suggestion_suggestion1: {
          id: 'suggestion1',
          createdAt: 1_742_652_370_104,
          type: 'insert',
          userId: 'charlie',
        },
        text: 'suggestions',
      },
      {
        text: ', or ',
      },
      {
        comment: true,
        comment_discussion2: true,
        text: 'collaborate',
      },
      {
        text: ' with others',
      },
    ],
    type: 'paragraph',
  },
  {
    type: 'h3',
    children: [
      {
        text: 'Heading',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 1,
    listStyleType: 'disc',
    children: [
      {
        text: '1',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 2,
    listStyleType: 'disc',
    children: [
      {
        text: '2',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 3,
    listStyleType: 'disc',
    children: [
      {
        text: '3',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 4,
    listStyleType: 'disc',
    children: [
      {
        text: '4',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 1,
    listStyleType: 'disc',
    children: [
      {
        text: 'parent style change',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 2,
    listStyleType: 'decimal',
    listStart: 1,
    children: [
      {
        text: 'child ordered style split',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 2,
    listStyleType: 'disc',
    listStart: 1,
    children: [
      {
        text: 'child bullet style split',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 2,
    listStyleType: 'todo',
    checked: true,
    children: [
      {
        text: 'child todo style split',
      },
    ],
  },
  {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: '1-1',
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '1-2',
                  },
                ],
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
              {
                children: [
                  {
                    text: '2-1',
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'tableCell',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '2-2',
                  },
                ],
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
  {
    children: [
      {
        text: 'blockQuote',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'horizontalRule',
  },
  {
    children: [
      {
        text: 'normal ',
      },
      {
        bold: true,
        text: 'bold',
      },
      {
        italic: true,
        text: 'italic',
      },
      {
        text: 'strikethrough',
        strikethrough: true,
      },
      {
        text: 'code',
        code: true,
      },
      {
        text: 'combine',
        bold: true,
        italic: true,
      },
      {
        children: [{ text: 'link' }],
        type: 'link',
        url: 'https://example.com',
        target: '_blank',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        texExpression: 'E=mc^2',
        type: 'inlineEquation',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [{ text: 'test' }],
    type: 'image',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    type: 'codeBlock',
    lang: 'javascript',
    children: [
      {
        type: 'codeLine',
        children: [
          {
            text: '// Use code blocks to showcase code snippets',
          },
        ],
      },
      {
        type: 'codeLine',
        children: [
          {
            text: 'function greet() {',
          },
        ],
      },
      {
        type: 'codeLine',
        children: [
          {
            text: "  console.info('Hello World!');",
          },
        ],
      },
      {
        type: 'codeLine',
        children: [
          {
            text: '}',
          },
        ],
      },
    ],
  },
  {
    children: [
      {
        text: '',
      },
    ],
    texExpression: 'f(x)',
    type: 'equation',
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
    checked: true,
    indent: 1,
    listStyleType: 'todo',
    children: [
      {
        text: 'Todo item',
      },
    ],
  },
  {
    type: 'paragraph',
    indent: 1,
    listStyleType: 'decimal',
    children: [
      {
        text: 'Numbered list item',
      },
    ],
  },
  {
    type: 'toggle',
    children: [
      {
        text: 'Toggle item',
      },
    ],
  },
  {
    type: 'paragraph',
    textAlign: 'center',
    children: [
      {
        text: 'Centered text',
      },
    ],
  },
  {
    type: 'paragraph',
    lineHeight: 2,
    children: [
      {
        text: 'Text with custom line height',
      },
    ],
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'file',
    name: 'sample.pdf',
    url: 'https://example.com/sample.pdf',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'audio',
    url: 'https://example.com/audio.mp3',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'video',
    url: 'https://example.com/video.mp4',
  },
  {
    children: [
      {
        text: '',
      },
    ],
    type: 'mediaEmbed',
    url: 'https://www.youtube.com/watch?v=example',
  },
  {
    type: 'columnGroup',
    layout: [50, 50],
    children: [
      {
        type: 'column',
        width: '50%',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Left column',
              },
            ],
          },
        ],
      },
      {
        type: 'column',
        width: '50%',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Right column',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Mention: ',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'mention',
        value: 'User',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Date: ',
      },
      {
        children: [
          {
            text: '',
          },
        ],
        type: 'date',
        date: '2024-01-01',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Text with ',
      },
      {
        text: 'highlight',
        highlight: true,
      },
      {
        text: ' and ',
      },
      {
        text: 'underline',
        underline: true,
      },
      {
        text: ' and ',
      },
      {
        text: 'keyboard',
        kbd: true,
      },
      {
        text: ' formatting',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Text with ',
      },
      {
        text: 'color',
        color: 'rgb(252, 109, 38)',
      },
      {
        text: ' and ',
      },
      {
        text: 'background',
        backgroundColor: 'rgb(252, 109, 38)',
      },
      {
        text: ' color',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Superscript: x',
      },
      {
        text: '2',
        script: 'sup',
      },
      {
        text: 'Subscript: x',
      },
      {
        text: '2',
        script: 'sub',
      },
    ],
  },
  {
    children: [
      {
        text: 'callout',
      },
    ],
    icon: '💡',
    type: 'callout',
  },
];
