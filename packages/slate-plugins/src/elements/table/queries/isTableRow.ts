import { Node } from 'slate';
import { TableType } from '../types';

export const isTableRow = (n: Node) => n.type === TableType.ROW;
