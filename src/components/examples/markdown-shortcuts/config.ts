export const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text:
          'The editor gives you full control over the logic you can add. For example, it\'s fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with "> " you get a blockquote that looks like this:',
        marks: [],
      },
    ],
  },
  {
    type: 'block-quote',
    children: [
      {
        text: 'A wise quote.',
        marks: [],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Order when you start a line with "## " you get a level-two heading, like this:',
        marks: [],
      },
    ],
  },
  {
    type: 'heading-two',
    children: [
      {
        text: 'Try it out!',
        marks: [],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Try it out for yourself! Try starting a new line with ">", "-", or "#"s.',
        marks: [],
      },
    ],
  },
];
