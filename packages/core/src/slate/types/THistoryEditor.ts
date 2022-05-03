import { HistoryEditor } from 'slate-history';
import { TEditor, Value } from './TEditor';

export type THistoryEditor<V extends Value> = TEditor<V> &
  Pick<HistoryEditor, 'history' | 'undo' | 'redo'>;
