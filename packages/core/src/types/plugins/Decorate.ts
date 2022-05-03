import { Range } from 'slate';
import { Value } from '../../slate/types/TEditor';
import { ENodeEntry } from '../../slate/types/TNodeEntry';
import { PlateEditor } from '../PlateEditor';
import { WithPlatePlugin } from './PlatePlugin';

/**
 * Property used by Plate to decorate editor ranges.
 * If the function returns undefined then no ranges are modified.
 * If the function returns an array the returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<V extends Value, T = {}, P = {}> = (
  editor: PlateEditor<V, T>,
  plugin: WithPlatePlugin<V, T, P>
) => (entry: ENodeEntry<V>) => Range[] | undefined;
