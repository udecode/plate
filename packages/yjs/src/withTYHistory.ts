import { withYHistory } from '@slate-yjs/core';
import {
  WithYHistoryOptions,
  YHistoryEditor,
  // eslint-disable-next-line import/no-unresolved
} from '@slate-yjs/core/dist/plugins/withYHistory';
import { TEditor, Value } from '@udecode/plate-common';

import { YjsEditorProps } from './withTYjs';

export type YHistoryEditorProps = YjsEditorProps &
  Pick<YHistoryEditor, 'undoManager' | 'withoutSavingOrigin' | 'undo' | 'redo'>;

export const withTYHistory = <
  V extends Value,
  E extends TEditor<V> & YjsEditorProps,
  EE extends E & YHistoryEditorProps = E & YHistoryEditorProps,
>(
  editor: E,
  options?: WithYHistoryOptions
) => withYHistory(editor as any, options) as any as EE;
