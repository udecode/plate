import type { Node } from '@platejs/plite';

import defaults from 'lodash/defaults.js';

import {
  type ApplyDeepToNodesOptions,
  applyDeepToNodes,
} from './applyDeepToNodes';

/** Recursively merge a source object to children nodes with a query. */
export const defaultsDeepToNodes = <N extends Node>(
  options: Omit<ApplyDeepToNodesOptions<N>, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: defaults });
};
