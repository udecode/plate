import { Range } from 'slate';
import { Value } from '../../slate/editor/TEditor';
import { ENodeEntry } from '../../slate/node/TNodeEntry';
import { PlateEditor } from '../PlateEditor';
import { WithPlatePlugin } from './PlatePlugin';

/**
 * Property used by Plate to decorate editor ranges.
 * If the function returns undefined then no ranges are modified.
 * If the function returns an array the returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<
  P = {},
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = (
  editor: E,
  plugin: WithPlatePlugin<P, V, E>
) => (entry: ENodeEntry<V>) => Range[] | undefined;
