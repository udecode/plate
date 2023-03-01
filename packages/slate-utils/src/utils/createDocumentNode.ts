import { TDescendant } from '../slate/node/TDescendant';

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
