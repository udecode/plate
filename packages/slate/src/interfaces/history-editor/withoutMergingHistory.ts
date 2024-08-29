import { HistoryEditor } from 'slate-history';

import type { TEditor } from '../editor';

/** {@link HistoryEditor.withoutMerging} */
export const withoutMergingHistory = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withoutMerging(editor as any, fn);
