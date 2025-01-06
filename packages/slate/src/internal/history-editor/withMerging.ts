import type { Editor } from '../../interfaces/editor/editor';

import { HistoryEditor } from '../../slate-history';

export const withMerging = (editor: Editor, fn: () => void) =>
  HistoryEditor.withMerging(editor as any, fn);
