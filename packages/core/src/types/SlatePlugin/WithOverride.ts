import { TEditor } from '../TEditor';

/**
 * Plate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<
  TEditorInput extends TEditor = TEditor,
  TEditorOutputExtension = {}
> = <T extends TEditorInput>(editor: T) => T & TEditorOutputExtension;
