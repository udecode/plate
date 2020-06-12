import { Node } from 'slate';
import { defaultTableTypes } from '../types';

export const isTableCell = (options = defaultTableTypes) => (n: Node) =>
  n.type === options.typeTd || n.type === options.typeTh;
