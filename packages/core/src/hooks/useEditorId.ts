import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SPEditor } from '../types/SPEditor';
import { useTSlateStatic } from './useTSlateStatic';

export interface IdEditor {
  id: string;
}

/**
 * Editor id stored in `editor`.
 */
export const useEditorId = <
  TEditor extends ReactEditor & IdEditor & SPEditor = ReactEditor &
    IdEditor &
    HistoryEditor &
    SPEditor
>() => useTSlateStatic<TEditor>().id;
