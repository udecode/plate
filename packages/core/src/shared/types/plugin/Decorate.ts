import type { TNodeEntry } from '@udecode/slate';
import type { Range } from 'slate';

import type { PlatePluginContext } from './PlatePlugin';

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<O = {}, A = {}, T = {}, S = {}> = (
  ctx: { entry: TNodeEntry } & PlatePluginContext<string, O, A, T, S>
) => Range[] | undefined;
