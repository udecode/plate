import { HistoryEditor } from 'slate-history';

import type { Value } from '../editor/TEditor';
import type { THistoryEditor } from './THistoryEditor';

/** {@link HistoryEditor.withoutMerging} */
export const withoutMergingHistory = <V extends Value>(
  editor: THistoryEditor<V>,
  fn: () => void
) => HistoryEditor.withoutMerging(editor as any, fn);
