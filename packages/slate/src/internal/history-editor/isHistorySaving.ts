import type { Editor } from '../../interfaces/editor/editor';

import { HistoryEditor } from '../../slate-history';

export const isHistorySaving = (editor: Editor) =>
  HistoryEditor.isSaving(editor as any);
