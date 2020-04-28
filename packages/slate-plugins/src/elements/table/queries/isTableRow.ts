import { Node } from 'slate';
import { defaultTableTypes } from '../types';

export const isTableRow = (options = defaultTableTypes) => (n: Node) =>
  n.type === options.typeTr;
