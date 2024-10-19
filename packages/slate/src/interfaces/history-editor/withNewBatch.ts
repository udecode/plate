import type { TEditor } from '../editor';

import { HistoryEditor } from './slate-history';

/** {@link HistoryEditor.withMerging} */
export const withMerging = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withMerging(editor as any, fn);
