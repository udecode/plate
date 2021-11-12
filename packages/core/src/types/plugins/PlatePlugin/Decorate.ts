import { NodeEntry, Range } from 'slate';
import { PlateEditor } from '../../PlateEditor';
import { PlatePlugin } from './PlatePlugin';

/**
 * Function used to decorate ranges.
 * If the function returns undefined then no ranges are modified.
 * If the function returns an array the returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: PlatePlugin<T, P>
) => (entry: NodeEntry) => Range[] | undefined;
