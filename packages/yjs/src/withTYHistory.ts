import type { TEditor, Value } from '@udecode/plate-common/server';
import type * as Y from 'yjs';

import {
  type WithYHistoryOptions,
  type YjsEditor,
  withYHistory,
} from '@slate-yjs/core';

import type { YjsEditorProps } from './withTYjs';

export type YHistoryEditor = {
  redo: () => void;

  undo: () => void;

  undoManager: Y.UndoManager;
  withoutSavingOrigin: unknown;
} & YjsEditor;

export type YHistoryEditorProps = Pick<
  YHistoryEditor,
  'redo' | 'undo' | 'undoManager' | 'withoutSavingOrigin'
> &
  YjsEditorProps;

export const withTYHistory = <
  V extends Value,
  E extends TEditor<V> & YjsEditorProps,
  EE extends E & YHistoryEditorProps = E & YHistoryEditorProps,
>(
  editor: E,
  options?: WithYHistoryOptions
) => withYHistory(editor as any, options) as any as EE;
