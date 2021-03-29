import { Editor } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { WithOverride } from '../types/SlatePlugin/WithOverride';
import { getSlatePluginWithOverrides } from '../utils/getSlatePluginWithOverrides';

/**
 * {@link withHistory} that can be called multiple times without losing its history.
 */
export const withHistoryPersist: WithOverride<Editor, HistoryEditor> = (
  editor
) => {
  if (HistoryEditor.isHistoryEditor(editor)) {
    const { history } = editor;

    const editorWithHistory = withHistory(editor);
    editorWithHistory.history = history;
    return editorWithHistory;
  }

  return withHistory(editor);
};

/**
 * @see {@link withHistoryPersist}
 */
export const createHistoryPlugin = getSlatePluginWithOverrides(
  () => withHistory
);
