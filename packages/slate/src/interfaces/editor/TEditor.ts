import type { UnknownObject } from '@udecode/utils';
import type { Range } from 'slate';

import type { HistoryEditor } from '../../slate-history';
import type { TOperation } from '../../types/TOperation';
import type { TElement } from '../element/TElement';
import type { DescendantIn } from '../node';
import type { LegacyEditorMethods } from './LegacyEditorMethods';
import type { TEditorApi } from './TEditorApi';
import type { TEditorTransforms } from './TEditorTransforms';

export type Value = TElement[];

export type TBaseEditor<V extends Value = Value> = {
  id: any;
  children: V;
  marks: Record<string, any> | null;
  operations: TOperation<DescendantIn<V>>[];
  selection: Range | null;
} & Pick<HistoryEditor, 'history'> &
  LegacyEditorMethods<V> &
  UnknownObject;

export type TEditor<V extends Value = Value> = TBaseEditor<V> & {
  api: TEditorApi<V>;
  tf: TEditorTransforms<V>;
  transforms: TEditorTransforms<V>;
};

/** A helper type for getting the value of an editor. */
export type ValueOf<E extends TEditor> = E['children'];
