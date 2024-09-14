import { HistoryEditor } from 'slate-history';

import type { TEditor } from '../editor';

/** {@link HistoryEditor.withMerging} */
export const withMerging = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withMerging(editor as any, fn);
