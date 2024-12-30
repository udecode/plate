import type { TElement } from '../interfaces';

export const createNode = (type = 'p', text = ''): TElement => ({
  children: [{ text }],
  type,
});
