import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { SPEditor } from '../types/SPEditor';

/**
 * Typed {@link useSlateStatic} & SPEditor.
 */
export const useTSlateStatic = <
  TEditor extends Editor = ReactEditor & HistoryEditor
>() => (useSlateStatic() as unknown) as TEditor & SPEditor;
