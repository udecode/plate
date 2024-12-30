import type { TDescendant } from '../interfaces';

export const createDocumentNode = (
  type = 'p',
  text = '',
  remaining: TDescendant[] = []
): TDescendant[] => [
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
