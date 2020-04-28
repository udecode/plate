import { Node } from 'slate';
import { defaultTableTypes } from '../types';

export const isTable = (options = defaultTableTypes) => (n: Node) =>
  n.type === options.typeTable;
