import { HistoryEditor } from 'slate-history';
import { Value } from '../editor/TEditor';
import { THistoryEditor } from './THistoryEditor';

/**
 * {@link HistoryEditor.isHistoryEditor}
 */
export const isHistoryEditor = (value: any): value is THistoryEditor<Value> =>
  HistoryEditor.isHistoryEditor(value as any);
