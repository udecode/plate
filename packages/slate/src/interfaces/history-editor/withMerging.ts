import type { TEditor } from '../editor';

import { HistoryEditor } from '../../slate-history';

export const withMerging = (editor: TEditor, fn: () => void) =>
  HistoryEditor.withMerging(editor as any, fn);
