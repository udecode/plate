import { Node } from 'slate';
import { TableType } from '../types';

export const isTableCell = (n: Node) => n.type === TableType.CELL;
