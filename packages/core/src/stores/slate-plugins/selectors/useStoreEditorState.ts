import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SPEditor } from '../../../types/SPEditor';
import { useSlatePluginsStore } from '../slate-plugins.store';
import { getSlatePluginsState } from './getSlatePluginsState';
import { useStoreEditorRef } from './useStoreEditorRef';

/**
 * Get editor state which is updated on editor change.
 */
export const useStoreEditorState = <
  T extends SPEditor = SPEditor & ReactEditor & HistoryEditor
>(
  id?: string | null
) => {
  useSlatePluginsStore(
    (state) => getSlatePluginsState<T>(state as any, id)?.keyChange
  );

  return useStoreEditorRef(id);
};
