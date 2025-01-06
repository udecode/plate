import type { Editor } from '../../interfaces/editor/editor';

import { HistoryEditor } from '../../slate-history';

export const withoutMergingHistory = (editor: Editor, fn: () => void) =>
  HistoryEditor.withoutMerging(editor as any, fn);
