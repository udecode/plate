import { NodeEntry, Range } from 'slate';
import { SPEditor } from '../SPEditor';

/**
 * Function used to decorate ranges.
 * If the function returns undefined then no ranges are modified.
 * If the function returns an array the returned ranges are merged with the ranges called by other plugins.
 */
export type Decorate<T extends SPEditor = SPEditor> = (
  editor: T
) => (entry: NodeEntry) => Range[] | undefined;
