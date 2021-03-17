import { useCallback } from 'react';
import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SlatePluginsEditor } from '../with/withSlatePlugins';
import { useSlatePluginsStore } from './useSlatePluginsStore';

/**
 * Slate editor with generic type (default is `ReactEditor & HistoryEditor & RandomKeyEditor`).
 */
export const useSlatePluginsEditor = <
  TEditor extends Editor = ReactEditor & HistoryEditor & SlatePluginsEditor
>(
  id = 'main'
) =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[id]?.editor as TEditor, [id])
  );
