import { Node } from 'slate';
import { ListType } from '../types';

export const isListItem = (node: Node) => node.type === ListType.LIST_ITEM;
