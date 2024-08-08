import type { PlateEditor } from '../../shared';

import {
  type CreatePlateEditorOptions,
  createPlateEditor,
} from './createPlateEditor';

export const createPlateFallbackEditor = <E extends PlateEditor = PlateEditor>(
  options: CreatePlateEditorOptions<E> = {}
): E => {
  const editor = createPlateEditor<E>(options);

  editor.isFallback = true;

  editor.apply = () => {
    throw new Error(
      'Cannot apply operations on the fallback editor. The fallback editor is used when a hook that depends on the Plate store was unable to locate a valid store. If you are using PlateController, use `useEditorMounted(id?: PlateId)` or `!editor.isFallback` to ensure that a valid Plate store is available before attempting to call operations on the editor.'
    );
  };

  return editor;
};
