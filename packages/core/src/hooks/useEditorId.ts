import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SlatePluginsEditor } from '../plugins/useSlatePluginsPlugin';
import { useEditorStatic } from './useEditorStatic';

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
>() => useEditorStatic<TEditor>().id;
