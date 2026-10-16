import {
  type EditorRuntimeCarrier,
  getEditorRuntimeOwner,
} from './editor-runtime';

export type EditorLifetime = 'destroyed' | 'dormant' | 'live' | 'released';

const LIFETIMES = new WeakMap<object, EditorLifetime>();

export const getEditorLifetime = (
  editor: EditorRuntimeCarrier
): EditorLifetime => LIFETIMES.get(getEditorRuntimeOwner(editor)) ?? 'live';

export const setEditorLifetime = (
  editor: EditorRuntimeCarrier,
  lifetime: EditorLifetime
) => {
  LIFETIMES.set(getEditorRuntimeOwner(editor), lifetime);
};

export const assertEditorNotDestroyed = (editor: EditorRuntimeCarrier) => {
  if (getEditorLifetime(editor) === 'destroyed') {
    throw new Error('This editor was destroyed.');
  }
};
