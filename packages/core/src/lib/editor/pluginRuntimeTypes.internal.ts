import type { EditorExtensionTypes } from '@platejs/plite';
import type { EditorExtensionTypeLambda } from '@platejs/plite/internal';

/** @internal Nameable finite provider used by emitted Plate editor types. */
export interface StaticEditorExtensionTypeLambda<
  TOutput extends EditorExtensionTypes,
> extends EditorExtensionTypeLambda {
  readonly output: TOutput;
}
