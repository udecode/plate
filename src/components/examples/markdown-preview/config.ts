import { Node } from 'slate';

export const initialValue: Node[] = [
  {
    children: [
      {
        text:
          'Slate is flexible enough to add **decorations** that can format text based on its content. For example, this editor has **Markdown** preview decorations on it, to make it _dead_ simple to make an editor with built-in Markdown previewing.',
      },
    ],
  },
  {
    children: [{ text: '## Try it out!' }],
  },
  {
    children: [{ text: 'Try it out for yourself!' }],
  },
];
