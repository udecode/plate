import type { Editor } from '../../interfaces/editor/editor';

import { HistoryEditor } from '../../slate-history';

export const withoutSavingHistory = (editor: Editor, fn: () => void) =>
  HistoryEditor.withoutSaving(editor as any, fn);
