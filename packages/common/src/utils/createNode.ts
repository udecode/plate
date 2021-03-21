import { TElement } from '@udecode/slate-plugins-core';

export const createNode = (type = 'p', text = ''): TElement => ({
  type,
  children: [{ text }],
});
