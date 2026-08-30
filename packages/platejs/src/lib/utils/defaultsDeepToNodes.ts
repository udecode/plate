import defaults from 'lodash/defaults.js';

import type { Descendant } from '../../facade';
import {
  type ApplyDeepToNodesOptions,
  applyDeepToNodes,
} from './applyDeepToNodes';

/** Recursively merge a source object to children nodes with a query. */
export const defaultsDeepToNodes = <N extends Descendant>(
  options: Omit<ApplyDeepToNodesOptions<N>, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: defaults });
};
