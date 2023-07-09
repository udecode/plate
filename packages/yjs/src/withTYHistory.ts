import { withYHistory } from '@slate-yjs/core';
import {
  WithYHistoryOptions,
  YHistoryEditor,
  // eslint-disable-next-line import/no-unresolved
} from '@slate-yjs/core/dist/plugins/withYHistory';
import { Value } from '@udecode/plate-common';

import { YjsEditorProps } from './withTYjs';

export type TYHistoryEditor<V extends Value = Value> = YjsEditorProps<V> &
  Pick<YHistoryEditor, 'undoManager' | 'withoutSavingOrigin' | 'undo' | 'redo'>;

export const withTYHistory = <
  V extends Value,
  E extends YjsEditorProps<V>,
  EE extends E & TYHistoryEditor<V> = E & TYHistoryEditor<V>
>(
  editor: E,
  options?: WithYHistoryOptions
) => withYHistory(editor as any, options) as any as EE;
