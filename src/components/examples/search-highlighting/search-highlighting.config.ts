import { Node } from 'slate';

export const initialValue: Node[] = [
  {
    children: [
      {
        text:
          'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
      },
      { text: 'decorations', bold: true },
      { text: ' to them in realtime.' },
    ],
  },
  {
    children: [
      { text: 'Try it out for yourself by typing in the search box above!' },
    ],
  },
];
