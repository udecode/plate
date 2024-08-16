import { HistoryEditor } from 'slate-history';

import type { TEditor } from '../editor';

/** {@link HistoryEditor.isMerging} */
export const isHistoryMerging = (editor: TEditor) =>
  HistoryEditor.isMerging(editor as any);
