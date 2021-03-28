import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useSlate } from 'slate-react';
import { SPEditor } from '../types/SPEditor';

/**
 * Typed {@link useSlate} & SPEditor.
 */
export const useTSlate = <
  TEditor extends TEditor = ReactEditor & HistoryEditor
>() => useSlate() as TEditor & SPEditor;
