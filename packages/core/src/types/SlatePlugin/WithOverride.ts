/**
 * Slate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
import { Editor } from 'slate';

export type WithOverride<
  TEditorInput extends Editor = Editor,
  TEditorExtension = {}
> = <T extends TEditorInput>(editor: T) => T & TEditorExtension;
