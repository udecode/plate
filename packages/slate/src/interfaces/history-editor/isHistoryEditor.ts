import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

export const isHistoryEditor = (value: any): value is TEditor =>
  HistoryEditor.isHistoryEditor(value as any);
