import { useCallback } from 'react';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SPEditor } from '../../../types/SPEditor';
import { useSlatePluginsStore } from '../slate-plugins.store';
import { getSlatePluginsState } from './getSlatePluginsState';

/**
 * Get editor state.
 */
export const useStoreEditorState = <
  T extends SPEditor = SPEditor & ReactEditor & HistoryEditor
>(
  id?: string | null
) => {
  useSlatePluginsStore(
    useCallback(
      (state) =>
        getSlatePluginsState<T>(state as any, id)?.editorState?.keyChange,
      [id]
    )
  );

  return useSlatePluginsStore(
    useCallback(
      (state) => getSlatePluginsState<T>(state as any, id)?.editorState,
      [id]
    )
  );
};
