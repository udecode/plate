import { HistoryEditor } from 'slate-history';

import type { THistoryEditor } from './THistoryEditor';

/** {@link HistoryEditor.withoutMerging} */
export const withoutMergingHistory = (editor: THistoryEditor, fn: () => void) =>
  HistoryEditor.withoutMerging(editor as any, fn);
