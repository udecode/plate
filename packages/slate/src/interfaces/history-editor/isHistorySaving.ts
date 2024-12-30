import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

export const isHistorySaving = (editor: TEditor) =>
  HistoryEditor.isSaving(editor as any);
