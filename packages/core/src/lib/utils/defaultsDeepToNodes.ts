import type { TNode } from '@udecode/slate';

import defaults from 'lodash/defaults.js';

import {
  type ApplyDeepToNodesOptions,
  applyDeepToNodes,
} from './applyDeepToNodes';

/** Recursively merge a source object to children nodes with a query. */
export const defaultsDeepToNodes = <N extends TNode>(
  options: Omit<ApplyDeepToNodesOptions<N>, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: defaults });
};
