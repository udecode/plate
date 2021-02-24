import { Editor } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';

/**
 * {@link withHistory} that can be called multiple times without losing its history.
 */
export const withHistoryPersist = <T extends Editor>(editor: T) => {
  if (HistoryEditor.isHistoryEditor(editor)) {
    const { history } = editor;

    const editorWithHistory = withHistory(editor);
    editorWithHistory.history = history;
    return editorWithHistory;
  }

  return withHistory(editor);
};
