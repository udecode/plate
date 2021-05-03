import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useSlate } from 'slate-react';
import { SPEditor } from '../types/SPEditor';
import { TEditor } from '../types/TEditor';

/**
 * Typed {@link useSlate} & SPEditor.
 */
export const useEditorState = <
  T extends TEditor = ReactEditor & HistoryEditor
>() => (useSlate() as unknown) as T & SPEditor;
