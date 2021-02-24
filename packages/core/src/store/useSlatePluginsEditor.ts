import { useCallback } from 'react';
import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { RandomKeyEditor } from '../with/randomKeyEditor';
import { useSlatePluginsStore } from './useSlatePluginsStore';

/**
 * Slate editor with generic type (default is `ReactEditor & HistoryEditor & RandomKeyEditor`).
 */
export const useSlatePluginsEditor = <
  TEditor extends Editor = ReactEditor & HistoryEditor & RandomKeyEditor
>(
  id = 'main'
) =>
  useSlatePluginsStore(
    useCallback((state) => state.byId[id]?.editor as TEditor, [id])
  );
