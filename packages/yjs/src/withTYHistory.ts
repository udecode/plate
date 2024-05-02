import { withYHistory, WithYHistoryOptions, YjsEditor } from '@slate-yjs/core';
import { TEditor, Value } from '@udecode/plate-common/server';
import * as Y from 'yjs';

import { YjsEditorProps } from './withTYjs';

export type YHistoryEditor = YjsEditor & {
  undoManager: Y.UndoManager;

  withoutSavingOrigin: unknown;

  undo: () => void;
  redo: () => void;
};

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
