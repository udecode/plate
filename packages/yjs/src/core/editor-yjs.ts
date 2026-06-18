import type {
  EditorCoreStateView,
  EditorCoreUpdateTransaction,
} from '@platejs/slate';

import type { YjsState, YjsTx } from './types';

type EditorYjsStateView = EditorCoreStateView & {
  yjs: YjsState;
};

type EditorYjsUpdateTransaction = EditorCoreUpdateTransaction & {
  yjs: YjsTx;
};

export const getEditorYjsState = (state: EditorCoreStateView): YjsState =>
  (state as EditorYjsStateView).yjs;

export const getEditorYjsTx = (tx: EditorCoreUpdateTransaction): YjsTx =>
  (tx as EditorYjsUpdateTransaction).yjs;
