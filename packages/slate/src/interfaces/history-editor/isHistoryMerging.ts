import type { TEditor } from '../editor';

import { HistoryEditor } from './slate-history';

/** {@link HistoryEditor.isMerging} */
export const isHistoryMerging = (editor: TEditor) =>
  HistoryEditor.isMerging(editor as any);
