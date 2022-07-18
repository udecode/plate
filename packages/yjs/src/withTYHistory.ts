import { withYHistory } from '@slate-yjs/core';
import {
  WithYHistoryOptions,
  YHistoryEditor,
} from '@slate-yjs/core/dist/plugins/withYHistory';
import { Value } from '@udecode/plate';
import { TYjsEditor } from './withTYjs';

export type TYHistoryEditor<V extends Value = Value> = TYjsEditor<V> &
  Pick<YHistoryEditor, 'undoManager' | 'withoutSavingOrigin' | 'undo' | 'redo'>;

export const withTYHistory = <
  V extends Value,
  E extends TYjsEditor<V>,
  EE extends E & TYHistoryEditor<V> = E & TYHistoryEditor<V>
>(
  editor: E,
  options?: WithYHistoryOptions
) => (withYHistory(editor as any, options) as any) as EE;
