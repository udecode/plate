import { TElement } from '@udecode/slate';

export const createNode = (type = 'p', text = ''): TElement => ({
  type,
  children: [{ text }],
});
