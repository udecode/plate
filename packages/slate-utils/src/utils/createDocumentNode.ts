import { TDescendant } from '@udecode/slate';

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
  } as any,
];
