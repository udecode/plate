import type { TElement } from '@udecode/slate';

export const createNode = (type = 'p', text = ''): TElement => ({
  children: [{ text }],
  type,
});
