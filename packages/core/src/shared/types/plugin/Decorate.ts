import type { ENodeEntry, Value } from '@udecode/slate';
import type { Range } from 'slate';

import type { PlateEditor } from '../PlateEditor';
import type { PluginOptions, WithPlatePlugin } from './PlatePlugin';

export type DecorateEntry<V extends Value = Value> = (
  entry: ENodeEntry<V>
) => Range[] | undefined;

/**
 * Property used by Plate to decorate editor ranges. If the function returns
 * undefined then no ranges are modified. If the function returns an array the
 * returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = (
  editor: PlateEditor<V>,
  plugin: WithPlatePlugin<P, V, E>
) => DecorateEntry<V>;
