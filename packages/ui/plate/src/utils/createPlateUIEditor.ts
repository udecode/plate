import {
  createPlateEditor,
  CreatePlateEditorOptions,
  Value,
} from '@udecode/plate-headless';
import { createPlateUI } from './createPlateUI';

/**
 * Create a plate editor with default UI.
 */
export const createPlateUIEditor = <V extends Value = Value, T = {}>({
  components,
  ...options
}: CreatePlateEditorOptions<V, T> = {}) =>
  createPlateEditor<V, T>({
    ...options,
    components: createPlateUI(components),
  });
