import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useSlate } from 'slate-react';
import { SPEditor } from '../types/SPEditor';

/**
 * Typed {@link useSlate} & SPEditor.
 */
export const useTSlate = <
  TEditor extends Editor = ReactEditor & HistoryEditor
>() => (useSlate() as unknown) as TEditor & SPEditor;
