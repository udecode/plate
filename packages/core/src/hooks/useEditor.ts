import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useSlate, useSlateStatic } from 'slate-react';
import { SPEditor } from '../types/SPEditor';

/**
 * {@link useSlateStatic} with generic type.
 */
export const useEditorStatic = <
  TEditor extends Editor = ReactEditor & HistoryEditor & SPEditor
>() => (useSlateStatic() as unknown) as TEditor;

export const useEditorSlate = <
  TEditor extends Editor = ReactEditor & HistoryEditor & SPEditor
>() => (useSlate() as unknown) as TEditor;
