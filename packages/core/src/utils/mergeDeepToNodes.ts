import { TNode } from '@udecode/slate';
import merge from 'lodash/merge';

import { ApplyDeepToNodesOptions, applyDeepToNodes } from './applyDeepToNodes';

/**
 * Recursively merge a source object to children nodes with a query.
 */
export const mergeDeepToNodes = <N extends TNode>(
  options: Omit<ApplyDeepToNodesOptions<N>, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: merge });
};
