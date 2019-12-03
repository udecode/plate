export const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This is editable ',
        marks: [],
      },
      {
        text: 'rich',
        marks: [{ type: 'bold' }],
      },
      {
        text: ' text, ',
        marks: [],
      },
      {
        text: 'much',
        marks: [{ type: 'italic' }],
      },
      {
        text: ' better than a ',
        marks: [],
      },
      {
        text: '<textarea>',
        marks: [{ type: 'code' }],
      },
      {
        text: '!',
        marks: [],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
        marks: [],
      },
      {
        text: 'bold',
        marks: [{ type: 'bold' }],
      },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
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
        text: 'Try it out for yourself!',
        marks: [],
      },
    ],
  },
];
