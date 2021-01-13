import { Ancestor } from 'slate';
import { match } from '../../../common/utils/match';
import { ListOptions } from '../types';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = (node: Ancestor, options?: ListOptions) =>
  node.children.some((n) => match(n, { type: getListTypes(options) }));
