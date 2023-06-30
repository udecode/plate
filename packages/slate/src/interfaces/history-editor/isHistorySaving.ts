import { HistoryEditor } from 'slate-history';

import { Value } from '../editor/TEditor';
import { THistoryEditor } from './THistoryEditor';

/**
 * {@link HistoryEditor.isSaving}
 */
export const isHistorySaving = <V extends Value>(editor: THistoryEditor<V>) =>
  HistoryEditor.isSaving(editor as any);
