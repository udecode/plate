import { HistoryEditor } from 'slate-history';

import type { TEditor } from '../editor';

/** {@link HistoryEditor.withoutSaving} */
export const withoutSavingHistory = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withoutSaving(editor as any, fn);
