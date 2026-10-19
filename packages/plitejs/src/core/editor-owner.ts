import type { Editor } from '../interfaces/editor';
import {
  type EditorRuntimeCarrier,
  getEditorRuntimeOwner,
} from './editor-runtime';
import { destroyEditor, releaseEditor, startEditor } from './plugin';

/**
 * React behavior this owner relies on: insertion effects are never
 * rehearsed, so only a real unmount or replacement reaches `retire`; every
 * mutation-phase cleanup runs before any layout setup; a hidden Activity
 * disconnects layout and passive effects, while a Suspense boundary hiding
 * shown content keeps passive effects connected.
 */
export type EditorOwner<E extends EditorRuntimeCarrier = EditorRuntimeCarrier> =
  Readonly<{
    editor: E;
    layoutConnected: () => void;
    layoutDisconnected: () => void;
    passiveConnected: () => void;
    passiveDisconnected: () => void;
    retire: () => void;
    startUnlessViewStarted: () => void;
  }>;

type OwnerState = {
  destroyed: boolean;
  editor: Editor;
  layout: boolean;
  passive: boolean;
  released: boolean;
  retired: boolean;
  startedByView: boolean;
};

const OWNERS = new WeakMap<object, OwnerState>();
const UNRELEASED_RETIREES = new Set<OwnerState>();

const release = (state: OwnerState) => {
  UNRELEASED_RETIREES.delete(state);
  if (state.released) return;
  state.released = true;
  releaseEditor(state.editor);
};

const destroy = (state: OwnerState) => {
  release(state);
  if (state.destroyed) return;
  state.destroyed = true;
  destroyEditor(state.editor);
};

const releaseRetirees = () => {
  for (const retiree of [...UNRELEASED_RETIREES]) release(retiree);
};

const start = (state: OwnerState) => {
  if (state.retired) return;
  releaseRetirees();
  startEditor(state.editor);
};

/** @internal */
export const createEditorOwner = <E extends EditorRuntimeCarrier>(
  createDormant: () => E
): EditorOwner<E> => {
  const editor = createDormant();
  const state: OwnerState = {
    destroyed: false,
    editor: getEditorRuntimeOwner(editor),
    layout: false,
    passive: false,
    released: false,
    retired: false,
    startedByView: false,
  };

  OWNERS.set(state.editor, state);

  return Object.freeze({
    editor,
    layoutConnected: () => {
      state.layout = true;
    },
    layoutDisconnected: () => {
      state.layout = false;
      if (state.retired) release(state);
    },
    passiveConnected: () => {
      state.passive = true;
    },
    passiveDisconnected: () => {
      state.passive = false;
      if (state.retired) queueMicrotask(() => destroy(state));
    },
    retire: () => {
      if (state.retired) return;
      state.retired = true;
      UNRELEASED_RETIREES.add(state);
      // A hidden subtree's layout effects are already disconnected, so
      // deleting it never reaches `layoutDisconnected`.
      queueMicrotask(() => {
        if (state.layout) return;
        release(state);
        if (!state.passive) destroy(state);
      });
    },
    startUnlessViewStarted: () => {
      if (!state.startedByView) start(state);
    },
  });
};

/** @internal */
export const startOwnedEditor = (editor: EditorRuntimeCarrier) => {
  const state = OWNERS.get(getEditorRuntimeOwner(editor));

  if (!state) return;
  state.startedByView = true;
  start(state);
};
