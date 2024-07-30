import { HistoryEditor } from 'slate-history';

import type { THistoryEditor } from './THistoryEditor';

/** {@link HistoryEditor.withoutSaving} */
export const withoutSavingHistory = (editor: THistoryEditor, fn: () => void) =>
  HistoryEditor.withoutSaving(editor as any, fn);
