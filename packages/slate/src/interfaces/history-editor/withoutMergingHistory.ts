import { HistoryEditor } from 'slate-history';

import { Value } from '../editor/TEditor';
import { THistoryEditor } from './THistoryEditor';

/**
 * {@link HistoryEditor.withoutMerging}
 */
export const withoutMergingHistory = <V extends Value>(
  editor: THistoryEditor<V>,
  fn: () => void
) => HistoryEditor.withoutMerging(editor as any, fn);
