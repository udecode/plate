import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

/** {@link HistoryEditor.isSaving} */
export const isHistorySaving = (editor: TEditor) =>
  HistoryEditor.isSaving(editor as any);
