import defaults from 'lodash/defaults';
import {
  applyDeepToNodes,
  ApplyDeepToNodesOptions,
} from '../../utils/applyDeepToNodes';

/**
 * Recursively merge a source object to children nodes with a query.
 */
export const defaultsDeepToNodes = (
  options: Omit<ApplyDeepToNodesOptions, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: defaults });
};
