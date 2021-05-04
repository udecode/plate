import { useCallback } from 'react';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SPEditor } from '../../../types/SPEditor';
import { useSlatePluginsStore } from '../slate-plugins.store';
import { getSlatePluginsState } from './getSlatePluginsState';

/**
 * Get editor ref which is never updated.
 */
export const useStoreEditorRef = <
  T extends SPEditor = SPEditor & ReactEditor & HistoryEditor
>(
  id?: string | null
) =>
  useSlatePluginsStore(
    useCallback((state) => getSlatePluginsState<T>(state as any, id)?.editor, [
      id,
    ])
  );
