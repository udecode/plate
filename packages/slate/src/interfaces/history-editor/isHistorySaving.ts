import { HistoryEditor } from 'slate-history';

import type { THistoryEditor } from './THistoryEditor';

/** {@link HistoryEditor.isSaving} */
export const isHistorySaving = (editor: THistoryEditor) =>
  HistoryEditor.isSaving(editor as any);
