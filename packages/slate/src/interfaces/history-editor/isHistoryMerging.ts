import { HistoryEditor } from 'slate-history';

import type { THistoryEditor } from './THistoryEditor';

/** {@link HistoryEditor.isMerging} */
export const isHistoryMerging = (editor: THistoryEditor) =>
  HistoryEditor.isMerging(editor as any);
