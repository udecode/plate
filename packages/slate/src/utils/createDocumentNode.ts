import type { Descendant } from '../interfaces/node';

export const createDocumentNode = (
  type = 'p',
  text = '',
  remaining: Descendant[] = []
): Descendant[] => [
  {
    children: [
      {
        children: [{ text }],
        type,
      },
      ...remaining,
    ],
  } as any,
];
