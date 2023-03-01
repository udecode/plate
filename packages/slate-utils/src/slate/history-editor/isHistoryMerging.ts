import { HistoryEditor } from 'slate-history';
import { Value } from '../editor/TEditor';
import { THistoryEditor } from './THistoryEditor';

/**
 * {@link HistoryEditor.isMerging}
 */
export const isHistoryMerging = <V extends Value>(editor: THistoryEditor<V>) =>
  HistoryEditor.isMerging(editor as any);
