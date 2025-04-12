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
          createdAt: 1742652370104,
          type: 'remove',
          userId: 'user3',
        },
        text: 'insights',
      },
      {
        suggestion: true,
        suggestion_suggestion1: {
          id: 'suggestion1',
          createdAt: 1742652370104,
          type: 'insert',
          userId: 'user3',
        },
        text: 'suggesions',
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
    type: 'p',
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
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      {
        text: '1',
      },
    ],
  },
  {
    type: 'p',
    indent: 2,
    listStyleType: 'disc',
    children: [
      {
        text: '2',
      },
    ],
  },
  {
    type: 'p',
    indent: 3,
    listStyleType: 'disc',
    children: [
      {
        text: '3',
      },
    ],
  },
  {
    type: 'p',
    indent: 4,
    listStyleType: 'disc',
    children: [
      {
        text: '4',
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
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '1-2',
                  },
                ],
                type: 'p',
              },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
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
                type: 'p',
              },
            ],
            type: 'td',
          },
          {
            children: [
              {
                children: [
                  {
                    text: '2-2',
                  },
                ],
                type: 'p',
              },
            ],
            type: 'td',
          },
        ],
        type: 'tr',
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
    type: 'hr',
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
        type: 'a',
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
        type: 'inline_equation',
      },
    ],
    type: 'p',
  },
  {
    caption: [{ text: 'test' }],
    children: [{ text: '' }],
    type: 'img',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    type: 'code_block',
    lang: 'javascript',
    children: [
      {
        type: 'code_line',
        children: [
          {
            text: '// Use code blocks to showcase code snippets',
          },
        ],
      },
      {
        type: 'code_line',
        children: [
          {
            text: 'function greet() {',
          },
        ],
      },
      {
        type: 'code_line',
        children: [
          {
            text: "  console.info('Hello World!');",
          },
        ],
      },
      {
        type: 'code_line',
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
    type: 'p',
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
    type: 'p',
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
    type: 'p',
    align: 'center',
    children: [
      {
        text: 'Centered text',
      },
    ],
  },
  {
    type: 'p',
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
    type: 'media_embed',
    url: 'https://www.youtube.com/watch?v=example',
  },
  {
    type: 'column_group',
    layout: [50, 50],
    children: [
      {
        type: 'column',
        width: '50%',
        children: [
          {
            type: 'p',
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
            type: 'p',
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
    type: 'p',
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
    type: 'p',
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
    type: 'p',
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
    type: 'p',
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
];
