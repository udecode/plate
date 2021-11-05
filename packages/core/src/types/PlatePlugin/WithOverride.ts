import { PlateEditor } from '../PlateEditor';

/**
 * Plate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<TEditorInput = {}, TEditorOutputExtension = {}> = (
  editor: PlateEditor<TEditorInput>
) => PlateEditor<TEditorInput> & TEditorOutputExtension;
