import { HistoryEditor } from 'slate-history';

import { THistoryEditor } from './THistoryEditor';

/**
 * {@link HistoryEditor.isHistoryEditor}
 */
export const isHistoryEditor = (value: any): value is THistoryEditor =>
  HistoryEditor.isHistoryEditor(value as any);
