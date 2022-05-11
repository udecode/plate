import { withHistory } from 'slate-history';
import { TEditor, Value } from '../slate/editor/TEditor';
import { THistoryEditor } from '../slate/history-editor/THistoryEditor';
import { createPluginFactory } from '../utils/createPluginFactory';

export const withTHistory = <V extends Value, E extends TEditor<V>>(
  editor: E
) => (withHistory(editor as any) as any) as E & THistoryEditor<V>;

/**
 * @see {@link withHistory}
 */
export const createHistoryPlugin = createPluginFactory({
  key: 'history',
  withOverrides: withTHistory,
});
