import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useEditor } from 'slate-react';
import { RandomKeyEditor } from '../with/randomKeyEditor';

export interface IdEditor {
  id: string;
}

/**
 * Editor id stored in `editor`.
 */
export const useEditorId = <
  TEditor extends ReactEditor & IdEditor & RandomKeyEditor = ReactEditor &
    IdEditor &
    HistoryEditor &
    RandomKeyEditor
>() => (useEditor() as TEditor).id;
