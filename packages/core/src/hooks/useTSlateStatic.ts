import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useSlateStatic } from 'slate-react';
import { SPEditor } from '../types/SPEditor';

/**
 * Typed {@link useSlateStatic} & SPEditor.
 */
export const useTSlateStatic = <
  TEditor extends TEditor = ReactEditor & HistoryEditor
>() => useSlateStatic() as TEditor & SPEditor;
