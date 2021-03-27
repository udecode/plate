/**
 * Slate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
import { Editor } from 'slate';

export type WithOverride<
  TEditorInput extends Editor = Editor,
  TEditorOutputExtension = {}
> = <T extends TEditorInput>(editor: T) => T & TEditorOutputExtension;
