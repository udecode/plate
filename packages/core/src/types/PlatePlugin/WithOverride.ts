import { PlateEditor } from '../SPEditor';

/**
 * Plate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<TEditorInput = {}, TEditorOutputExtension = {}> = (
  editor: PlateEditor<TEditorInput>
) => PlateEditor<TEditorInput> & TEditorOutputExtension;
