export const testValue = [
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
];
