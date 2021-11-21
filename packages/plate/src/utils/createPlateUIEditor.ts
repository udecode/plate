import {
  createPlateEditor,
  CreatePlateEditorOptions,
} from '@udecode/plate-core';
import { createPlateUI } from './createPlateUI';

/**
 * Create a plate editor with default UI.
 */
export const createPlateUIEditor = <T = {}>({
  components,
  ...options
}: CreatePlateEditorOptions<T> = {}) =>
  createPlateEditor<T>({
    ...options,
    components: createPlateUI(components),
  });
