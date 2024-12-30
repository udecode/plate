import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

export const withNewBatch = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withNewBatch(editor as any, fn);
