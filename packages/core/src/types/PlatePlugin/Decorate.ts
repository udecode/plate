import { NodeEntry, Range } from 'slate';
import { PlateEditor, TPlateEditor } from '../SPEditor';

/**
 * Function used to decorate ranges.
 * If the function returns undefined then no ranges are modified.
 * If the function returns an array the returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<T = TPlateEditor> = (
  editor: T
) => (entry: NodeEntry) => Range[] | undefined;
