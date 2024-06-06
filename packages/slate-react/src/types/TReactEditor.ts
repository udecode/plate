import type { TEditor, Value } from '@udecode/slate';
import type { ReactEditor } from 'slate-react';

export type TReactEditor<V extends Value = Value> = Pick<
  ReactEditor,
  | 'hasEditableTarget'
  | 'hasRange'
  | 'hasSelectableTarget'
  | 'hasTarget'
  | 'insertData'
  | 'insertFragmentData'
  | 'insertTextData'
  | 'isTargetInsideNonReadonlyVoid'
  | 'setFragmentData'
> &
  TEditor<V>;
