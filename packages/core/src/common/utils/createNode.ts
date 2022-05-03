import { TElement } from '../../slate/types/TElement';

export const createNode = (type = 'p', text = ''): TElement => ({
  type,
  children: [{ text }],
});
