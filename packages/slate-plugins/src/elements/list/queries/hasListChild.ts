import { match } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Ancestor } from 'slate';
import { getListTypes } from './getListTypes';

/**
 * Is there a list child in the node.
 */
export const hasListChild = (node: Ancestor, options: SlatePluginsOptions) =>
  node.children.some((n) => match(n, { type: getListTypes(options) }));
