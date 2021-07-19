import { TElement } from '@udecode/plate-core';

export const createNode = (type = 'p', text = ''): TElement => ({
  type,
  children: [{ text }],
});
