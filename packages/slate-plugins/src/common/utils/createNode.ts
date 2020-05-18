import { Node } from 'slate';

export const createNode = (type = 'p', text = ''): Node => ({
  type,
  children: [{ text }],
});
