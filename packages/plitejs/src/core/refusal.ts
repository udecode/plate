import type { AnyEditor as Editor } from '../interfaces/editor';
import { getEditorRuntimeOwner } from './editor-runtime';

/**
 * Input the editor declines whole, not a fault: thrown to roll an update
 * back, then reported by the outermost update instead of rethrown.
 *
 * @internal
 */
export class EditorRefusalError extends Error {
  override name = 'EditorRefusalError';
  readonly refusal: unknown;

  constructor(refusal: unknown, message: string) {
    super(message);
    this.refusal = refusal;
  }
}

const LISTENERS = new WeakMap<object, Set<(refusal: unknown) => void>>();

/**
 * Hear each refusal an update of `editor`'s document reports, after its
 * rollback.
 *
 * @internal
 */
export const subscribeEditorRefusals = (
  editor: Editor,
  listener: (refusal: unknown) => void
) => {
  const owner = getEditorRuntimeOwner(editor);
  const listeners = LISTENERS.get(owner) ?? new Set();

  listeners.add(listener);
  LISTENERS.set(owner, listeners);

  return () => {
    listeners.delete(listener);
  };
};

/** @internal */
export const publishEditorRefusal = (editor: Editor, refusal: unknown) => {
  for (const listener of LISTENERS.get(getEditorRuntimeOwner(editor)) ?? []) {
    listener(refusal);
  }
};
