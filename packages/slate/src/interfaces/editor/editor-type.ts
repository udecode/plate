import type { UnknownObject } from '@udecode/utils';

import type { History } from '../../slate-history/history';
import type { TElement } from '../element';
import type { DescendantIn } from '../node';
import type { Operation } from '../operation';
import type { TRange } from '../range';
import type { EditorApi } from './editor-api';
import type { EditorTransforms } from './editor-transforms';

export type Editor<V extends Value = Value> = EditorBase<V> & {
  api: EditorApi<V>;
  tf: EditorTransforms<V>;
  transforms: EditorTransforms<V>;
};

export type EditorBase<V extends Value = Value> = {
  /** Unique identifier for the editor. */
  id: string;
  /** Value of the editor. */
  children: V;
  /** Contains the undos and redos of the editor. */
  history: History;
  /** Marks that are currently applied to the editor. */
  marks: EditorMarks | null;
  /** Operations that have been applied to the editor. */
  operations: Operation<DescendantIn<V>>[];
  /** The current selection of the editor. */
  selection: EditorSelection;
} & EditorMethods<V> &
  UnknownObject;

export type EditorMarks = Record<string, any>;

export type EditorMethods<V extends Value = Value> = Pick<
  EditorTransforms<V>,
  'redo' | 'undo'
>;

export type EditorSelection = TRange | null;

export type Value = TElement[];

/** A helper type for getting the value of an editor. */
export type ValueOf<E extends Editor> = E['children'];
