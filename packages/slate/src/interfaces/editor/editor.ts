import type { UnknownObject } from '@udecode/utils';

import type { History } from '../../slate-history/history';
import type { TElement } from '../element';
import type { DescendantIn } from '../node';
import type { Operation } from '../operation';
import type { TRange } from '../range';
import type { EditorApi } from './editor-api';
import type { EditorTransforms } from './editor-transforms';
import type { LegacyEditorMethods } from './legacy-editor';

export type Value = TElement[];

export type EditorBase<V extends Value = Value> = {
  /** Unique identifier for the editor. */
  id: any;
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

export type EditorMethods<V extends Value = Value> = Pick<
  EditorTransforms<V>,
  'redo' | 'undo'
> &
  Pick<
    LegacyEditorMethods<V>,
    | 'isElementReadOnly'
    | 'isInline'
    | 'isSelectable'
    | 'isVoid'
    | 'markableVoid'
  >;

export type Editor<V extends Value = Value> = EditorBase<V> & {
  api: EditorApi<V>;
  tf: EditorTransforms<V>;
  transforms: EditorTransforms<V>;
};

export type EditorSelection = TRange | null;

export type EditorMarks = Record<string, any>;

/** A helper type for getting the value of an editor. */
export type ValueOf<E extends Editor> = E['children'];
