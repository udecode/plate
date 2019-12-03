export const initialValue = [
  {
    children: [
      {
        text:
          "By default, pasting content into a Slate editor will use the clipboard's ",
        marks: [],
      },
      {
        text: "'text/plain'",
        marks: [{ type: 'code' }],
      },
      {
        text:
          " data. That's okay for some use cases, but sometimes you want users to be able to paste in content and have it maintaing its formatting. To do this, your editor needs to handle ",
        marks: [],
      },
      {
        text: "'text/html'",
        marks: [{ type: 'code' }],
      },
      {
        text: ' data. ',
        marks: [],
      },
    ],
  },
  {
    children: [
      {
        text: 'This is an example of doing exactly that!',
        marks: [],
      },
    ],
  },
  {
    children: [
      {
        text:
          "Try it out for yourself! Copy and paste some rendered HTML rich text content (not the source code) from another site into this editor and it's formatting should be preserved.",
        marks: [],
      },
    ],
  },
];
