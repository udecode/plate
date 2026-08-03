import type {
  EditorCoreStateView,
  EditorCoreUpdateTransaction,
  Value,
} from '@platejs/plite';

import type { YjsState, YjsTx } from './types';

type EditorYjsStateView<V extends Value> = EditorCoreStateView<V> & {
  yjs: YjsState;
};

type EditorYjsUpdateTransaction<V extends Value> =
  EditorCoreUpdateTransaction<V> & {
    yjs: YjsTx;
  };

export const getEditorYjsState = <V extends Value>(
  state: EditorCoreStateView<V>
): YjsState => (state as EditorYjsStateView<V>).yjs;

export const getEditorYjsTx = <V extends Value>(
  tx: EditorCoreUpdateTransaction<V>
): YjsTx => (tx as EditorYjsUpdateTransaction<V>).yjs;
