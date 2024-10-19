import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

/** {@link HistoryEditor.withoutSaving} */
export const withoutSavingHistory = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withoutSaving(editor as any, fn);
