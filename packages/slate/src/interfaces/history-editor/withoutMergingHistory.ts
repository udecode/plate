import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

export const withoutMergingHistory = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withoutMerging(editor as any, fn);
