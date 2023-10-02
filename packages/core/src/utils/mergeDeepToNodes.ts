import { TNode } from '@udecode/slate';
import { merge } from 'lodash-es';

import { applyDeepToNodes, ApplyDeepToNodesOptions } from './applyDeepToNodes';

/**
 * Recursively merge a source object to children nodes with a query.
 */
export const mergeDeepToNodes = <N extends TNode>(
  options: Omit<ApplyDeepToNodesOptions<N>, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: merge });
};
