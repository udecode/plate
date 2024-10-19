import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

/** {@link HistoryEditor.withoutMerging} */
export const withoutMergingHistory = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withoutMerging(editor as any, fn);
