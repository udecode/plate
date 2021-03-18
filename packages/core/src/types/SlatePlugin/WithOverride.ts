import { ReactEditor } from 'slate-react';

/**
 * Slate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<IEditor = ReactEditor, IEditorExtension = {}> = <
  T extends IEditor
>(
  editor: T
) => T & IEditorExtension;
