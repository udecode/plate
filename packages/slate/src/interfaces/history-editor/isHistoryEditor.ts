import { HistoryEditor } from 'slate-history';

import type { TEditor } from '../editor';

/** {@link HistoryEditor.isHistoryEditor} */
export const isHistoryEditor = (value: any): value is TEditor =>
  HistoryEditor.isHistoryEditor(value as any);
