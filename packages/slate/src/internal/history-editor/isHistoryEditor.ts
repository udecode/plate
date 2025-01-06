import type { Editor } from '../../interfaces/editor/editor';

import { HistoryEditor } from '../../slate-history';

export const isHistoryEditor = (value: any): value is Editor =>
  HistoryEditor.isHistoryEditor(value as any);
