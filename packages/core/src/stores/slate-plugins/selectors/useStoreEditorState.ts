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
  const a = useSlatePluginsStore((state) => {
    // console.log('AA', getSlatePluginsState<T>(state as any, id));
    return getSlatePluginsState<T>(state as any, id)?.keyChange;
  });
  // console.log('BB', a);

  return useStoreEditorRef(id);
};
