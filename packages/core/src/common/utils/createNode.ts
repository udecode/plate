import { TElement } from '../../types/slate/TElement';

export const createNode = (type = 'p', text = ''): TElement => ({
  type,
  children: [{ text }],
});
