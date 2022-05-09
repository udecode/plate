import { HistoryEditor } from 'slate-history';
import { Value } from '../editor/TEditor';
import { THistoryEditor } from './THistoryEditor';

/**
 * {@link HistoryEditor.withoutSaving}
 */
export const withoutSavingHistory = <V extends Value>(
  editor: THistoryEditor<V>,
  fn: () => void
) => HistoryEditor.withoutSaving(editor as any, fn);
