import { Node } from 'slate';
import { TableType } from '../types';

export const isTable = (n: Node) => n.type === TableType.TABLE;
