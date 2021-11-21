import merge from 'lodash/merge';
import { applyDeepToNodes, ApplyDeepToNodesOptions } from './applyDeepToNodes';

/**
 * Recursively merge a source object to children nodes with a query.
 */
export const mergeDeepToNodes = (
  options: Omit<ApplyDeepToNodesOptions, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: merge });
};
