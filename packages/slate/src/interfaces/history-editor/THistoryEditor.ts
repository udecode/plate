import { HistoryEditor } from 'slate-history';
import { TEditor, Value } from '../editor/TEditor';

export type THistoryEditor<V extends Value = Value> = TEditor<V> &
  Pick<HistoryEditor, 'history' | 'undo' | 'redo'>;
