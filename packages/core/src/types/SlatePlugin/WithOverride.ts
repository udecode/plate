/**
 * Slate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
import { Editor } from 'slate';
import { SPEditor } from '../SPEditor';

export type WithOverride<
  TEditorInput extends Editor = SPEditor,
  TEditorExtension = {}
> = <T extends TEditorInput>(editor: T) => T & TEditorExtension;
