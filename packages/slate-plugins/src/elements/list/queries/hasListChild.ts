import { match } from '@udecode/slate-plugins-common';
import { Ancestor } from 'slate';
import { ListOptions } from '../types';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = (node: Ancestor, options?: ListOptions) =>
  node.children.some((n) => match(n, { type: getListTypes(options) }));
