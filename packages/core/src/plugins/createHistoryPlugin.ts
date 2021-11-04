import { HistoryEditor, withHistory } from 'slate-history';
import { WithOverride } from '../types/PlatePlugin/WithOverride';
import { getPlatePluginWithOverrides } from '../utils/getPlatePluginWithOverrides';

/**
 * {@link withHistory} that can be called multiple times without losing its history.
 */
export const withHistoryPersist: WithOverride = (editor) => {
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
export const createHistoryPlugin = getPlatePluginWithOverrides(
  () => withHistory as WithOverride
);
