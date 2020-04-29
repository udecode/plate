import { Node } from 'slate';
import { defaultListTypes } from '../types';

export const isListItem = (options = defaultListTypes) => (node: Node) =>
  node.type === options.typeLi;
