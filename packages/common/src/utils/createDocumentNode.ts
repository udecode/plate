import { Node } from 'slate';

export const createDocumentNode = (
  type = 'p',
  text = '',
  remaining: Node[] = []
): Node[] => [
  {
    children: [
      {
        type,
        children: [{ text }],
      },
      ...remaining,
    ],
  },
];
