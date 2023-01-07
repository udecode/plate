import { ReactEditor } from 'slate-react';
import { TEditor, Value } from '../editor/TEditor';

export type TReactEditor<V extends Value = Value> = TEditor<V> &
  Pick<
    ReactEditor,
    | 'insertData'
    | 'insertFragmentData'
    | 'insertTextData'
    | 'setFragmentData'
    | 'hasRange'
    | 'hasTarget'
    | 'hasEditableTarget'
    | 'hasSelectableTarget'
    | 'isTargetInsideNonReadonlyVoid'
  >;
