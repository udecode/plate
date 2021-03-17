import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor, useEditor } from 'slate-react';
import { SlatePluginsEditor } from '../with/withSlatePlugins';

export interface IdEditor {
  id: string;
}

/**
 * Editor id stored in `editor`.
 */
export const useEditorId = <
  TEditor extends ReactEditor & IdEditor & SlatePluginsEditor = ReactEditor &
    IdEditor &
    HistoryEditor &
    SlatePluginsEditor
>() => (useEditor() as TEditor).id;
