import type { Descendant } from '@platejs/plite';
import merge from 'lodash/merge.js';

import {
  type ApplyDeepToNodesOptions,
  applyDeepToNodes,
} from './applyDeepToNodes';

/** Recursively merge a source object to children nodes with a query. */
export const mergeDeepToNodes = <N extends Descendant>(
  options: Omit<ApplyDeepToNodesOptions<N>, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: merge });
};
