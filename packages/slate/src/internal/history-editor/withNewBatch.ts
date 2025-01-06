import type { Editor } from '../../interfaces/editor/editor';

import { HistoryEditor } from '../../slate-history';

export const withNewBatch = (editor: Editor, fn: () => void) =>
  HistoryEditor.withNewBatch(editor as any, fn);
