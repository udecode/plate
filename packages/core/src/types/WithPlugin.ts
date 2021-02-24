import { Editor } from 'slate';

/**
 * Slate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithPlugin<IEditor = Editor, IEditorExtension = {}> = <
  T extends IEditor
>(
  editor: T
) => T & IEditorExtension;
