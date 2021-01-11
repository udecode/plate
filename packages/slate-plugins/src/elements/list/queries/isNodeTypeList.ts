import { Element, Node } from 'slate';
import { ListOptions } from '../types';
import { getListTypes } from './getListTypes';

export const isNodeTypeList = (
  n: Node,
  options?: ListOptions
): n is Element => {
  return getListTypes(options).includes(n.type as string);
};
