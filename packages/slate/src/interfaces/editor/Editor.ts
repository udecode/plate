import type { UnknownObject } from '@udecode/utils';
import type { Range } from 'slate';

import type { HistoryEditor } from '../../slate-history';
import type { TOperation } from '../../types/TOperation';
import type { TElement } from '../element/TElement';
import type { DescendantIn } from '../node';
import type { LegacyEditorMethods } from './legacy-editor';
import type { EditorApi } from './editor-api';
import type { EditorTransforms } from './editor-transforms';

export type Value = TElement[];

export type BaseEditor<V extends Value = Value> = {
  id: any;
  children: V;
  marks: Record<string, any> | null;
  operations: TOperation<DescendantIn<V>>[];
  selection: Range | null;
} & Pick<HistoryEditor, 'history'> &
  LegacyEditorMethods<V> &
  UnknownObject;

export type Editor<V extends Value = Value> = BaseEditor<V> & {
  api: EditorApi<V>;
  tf: EditorTransforms<V>;
  transforms: EditorTransforms<V>;
};

/** A helper type for getting the value of an editor. */
export type ValueOf<E extends Editor> = E['children'];
