import { TDescendant } from '@udecode/plate-core';

export const createDocumentNode = (
  type = 'p',
  text = '',
  remaining: TDescendant[] = []
): TDescendant[] => [
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
