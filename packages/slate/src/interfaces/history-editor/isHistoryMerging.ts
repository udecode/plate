import { HistoryEditor } from 'slate-history';

import type { Value } from '../editor/TEditor';
import type { THistoryEditor } from './THistoryEditor';

/** {@link HistoryEditor.isMerging} */
export const isHistoryMerging = <V extends Value>(editor: THistoryEditor<V>) =>
  HistoryEditor.isMerging(editor as any);
