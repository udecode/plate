import { HistoryEditor } from 'slate-history';

import type { TEditor } from '../editor';

/** {@link HistoryEditor.isSaving} */
export const isHistorySaving = (editor: TEditor) =>
  HistoryEditor.isSaving(editor as any);
