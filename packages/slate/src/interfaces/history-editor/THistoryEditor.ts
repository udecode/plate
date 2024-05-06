import type { HistoryEditor } from 'slate-history';

import type { TEditor, Value } from '../editor/TEditor';

export type THistoryEditor<V extends Value = Value> = Pick<
  HistoryEditor,
  'history' | 'redo' | 'undo' | 'writeHistory'
> &
  TEditor<V>;
