import type { Editor } from '../../interfaces/editor/editor';

import { HistoryEditor } from '../../slate-history';

export const isHistoryMerging = (editor: Editor) =>
  HistoryEditor.isMerging(editor as any);
