export const editorValueMock = [
  {
    children: [
      {
        text: 'to be skipped',
      },
    ],
    type: 'metadata',
  },
  {
    children: [
      {
        text: 'Rich Text Editor',
      },
    ],
    type: 'h1',
  },
  {
    children: [
      {
        text: 'Introduction',
      },
    ],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'H5 is a paragraph',
      },
    ],
    type: 'h5',
  },
  {
    children: [
      {
        text: 'H6 is skipped',
      },
    ],
    type: 'h6',
  },
  {
    children: [
      {
        text: 'Package contains a full-featured Rich Text Editor, based on open-source ',
      },
      {
        children: [
          {
            text: 'slate.js',
          },
        ],
        type: 'a',
        url: 'https://www.slatejs.org/',
      },
      {
        text: " library. Slate.JS is a framework to build editors, and it's highly configurable with plugins. Here we picked and tuned dozen of plugins, build several plugins ourselves, added common styles and UX on top of it. One can pick from our default set of plugins, or even introduce new, app-specific plugins, on top.",
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: 'Unlikely to most Rich-Text editors, Slate uses JSON data model instead of HTML, which allows it to embed any entities, like arbitrary React components. For example, this checkbox, is a custom react component:\nAn item\nWe include HTML to Slate JSON converter, which is also used to convert pasted HTML.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: 'Out of the box components',
      },
    ],
    type: 'h2',
  },
  {
    children: [
      {
        text: 'Basic layout',
      },
    ],
    type: 'h3',
  },
  {
    children: [
      {
        text: 'We support inline text styles: ',
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
        strikethrough: true,
        text: 'strikethrough',
      },
      {
        text: ', ',
      },
      {
        text: 'underline',
        underline: true,
      },
      {
        text: ', text colors: red, yellow, and green.',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        text: 'Numbered lists:',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            children: [
              {
                text: "In edit mode, we detect  '1.' and start list automatically",
              },
            ],
            type: 'lic',
          },
        ],
        type: 'li',
      },
      {
        children: [
          {
            children: [
              {
                text: "You can use 'tab' / 'shift/tab' to indent the list",
              },
            ],
            type: 'lic',
          },
        ],
        type: 'li',
      },
    ],
    type: 'ol',
  },
  {
    children: [
      {
        text: 'Bullet lists:',
      },
    ],
    type: 'p',
  },
  {
    children: [
      {
        children: [
          {
            children: [
              {
                text: "Type '- ' to start the list",
              },
            ],
            type: 'lic',
          },
        ],
        type: 'li',
      },
      {
        children: [
          {
            children: [
              {
                text: "You can create multi-level lists with 'tab' / 'shift+tab'. Example:",
              },
            ],
            type: 'lic',
          },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        text: 'Level 2',
                      },
                    ],
                    type: 'lic',
                  },
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                text: 'Level 3',
                              },
                            ],
                            type: 'lic',
                          },
                        ],
                        type: 'li',
                      },
                    ],
                    type: 'ul',
                  },
                ],
                type: 'li',
              },
            ],
            type: 'ul',
          },
        ],
        type: 'li',
      },
    ],
    type: 'ul',
  },
  {
    children: [
      {
        text: "There's also support 3 levels of headers, hyperlinks, superscript, and more.",
      },
    ],
    type: 'p',
  },
  // {
  //   children: [
  //     {
  //       text: '',
  //     },
  //   ],
  //   type: 'img',
  //   url: 'https://platejs.org/og.png',
  // },
  {
    children: [
      {
        text: 'Indent list 1',
      },
    ],
    indent: 1,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Indent list 1.1',
      },
    ],
    indent: 2,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Indent list 1.1.1',
      },
    ],
    indent: 3,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Indent list 1.2',
      },
    ],
    indent: 2,
    listStyleType: 'disc',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Indent ol 1',
      },
    ],
    indent: 1,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Indent ol 1.1',
      },
    ],
    indent: 2,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Indent ol 2',
      },
    ],
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    type: 'p',
  },
  {
    children: [
      {
        text: 'Custom node ',
      },
      {
        children: [{ text: '' }],
        type: 'mention',
        value: 'mention',
      },
      {
        color: 'blue',
        text: 'mark',
      },
    ],
    type: 'p',
  },
];
