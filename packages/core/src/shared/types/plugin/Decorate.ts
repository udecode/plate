import type { TNodeEntry } from '@udecode/slate';
import type { Range } from 'slate';

import type { PlateEditor } from '../PlateEditor';
import type { PlatePlugin } from './PlatePlugin';

export type DecorateEntry = (entry: TNodeEntry) => Range[] | undefined;

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<O = {}, T = {}, Q = {}, S = {}> = (
  editor: PlateEditor,
  plugin: PlatePlugin<O, T, Q, S>
) => DecorateEntry;
