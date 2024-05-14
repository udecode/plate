import type { ApplyDeepToNodesOptions } from '@udecode/plate-core';
import type { TNode } from '@udecode/slate';

import { applyDeepToNodes } from '@udecode/plate-core/server';
import defaults from 'lodash/defaults.js';

/** Recursively merge a source object to children nodes with a query. */
export const defaultsDeepToNodes = <N extends TNode>(
  options: Omit<ApplyDeepToNodesOptions<N>, 'apply'>
) => {
  applyDeepToNodes({ ...options, apply: defaults });
};
