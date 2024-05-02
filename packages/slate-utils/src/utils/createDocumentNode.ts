import type { TDescendant } from '@udecode/slate';

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
