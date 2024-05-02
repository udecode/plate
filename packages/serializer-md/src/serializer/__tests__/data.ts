export const editorValueMock = [
  {
    children: [
      {
        text: 'Rich Text Editor',
      },
    ],
    type: 'uui-richTextEditor-header-1',
  },
  {
    children: [
      {
        text: 'Introduction',
      },
    ],
    type: 'uui-richTextEditor-header-3',
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
        type: 'link',
        url: 'https://www.slatejs.org/',
      },
      {
        text: " library. Slate.JS is a framework to build editors, and it's highly configurable with plugins. Here we picked and tuned dozen of plugins, build several plugins ourselves, added common styles and UX on top of it. One can pick from our default set of plugins, or even introduce new, app-specific plugins, on top.",
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: 'Unlikely to most Rich-Text editors, Slate uses JSON data model instead of HTML, which allows it to embed any entities, like arbitrary React components. For example, this checkbox, is a custom react component:\nAn item\nWe include HTML to Slate JSON converter, which is also used to convert pasted HTML.',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: 'Out of the box components',
      },
    ],
    type: 'uui-richTextEditor-header-2',
  },
  {
    children: [
      {
        text: 'Basic layout',
      },
    ],
    type: 'uui-richTextEditor-header-3',
  },
  {
    children: [
      {
        text: 'We support inline text styles: ',
      },
      {
        text: 'bold',
        'uui-richTextEditor-bold': true,
      },
      {
        text: ', ',
      },
      {
        text: 'italic',
        'uui-richTextEditor-italic': true,
      },
      {
        text: ', underlined, text colors: red, yellow, and green.',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [
      {
        text: 'Numbered lists:',
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
                text: "In edit mode, we detect  '1.' and start list automatically",
              },
            ],
            type: 'list-item-child',
          },
        ],
        type: 'list-item',
      },
      {
        children: [
          {
            children: [
              {
                text: "You can use 'tab' / 'shift/tab' to indent the list",
              },
            ],
            type: 'list-item-child',
          },
        ],
        type: 'list-item',
      },
    ],
    type: 'ordered-list',
  },
  {
    children: [
      {
        text: 'Bullet lists:',
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
                text: "Type '- ' to start the list",
              },
            ],
            type: 'list-item-child',
          },
        ],
        type: 'list-item',
      },
      {
        children: [
          {
            children: [
              {
                text: "You can create multi-level lists with 'tab' / 'shift+tab'. Example:",
              },
            ],
            type: 'list-item-child',
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
                    type: 'list-item-child',
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
                            type: 'list-item-child',
                          },
                        ],
                        type: 'list-item',
                      },
                    ],
                    type: 'unordered-list',
                  },
                ],
                type: 'list-item',
              },
            ],
            type: 'unordered-list',
          },
        ],
        type: 'list-item',
      },
    ],
    type: 'unordered-list',
  },
  {
    children: [
      {
        text: "There's also support 3 levels of headers, hyperlinks, superscript, and more.",
      },
    ],
    type: 'paragraph',
  },
];
