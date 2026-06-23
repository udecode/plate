import type { Selection, Value } from '@platejs/slate';

import {
  type CreatePlateEditorRuntimeOptions,
  createPlateEditor,
} from '../editor/withPlate';
import type { PlateRuntimeEditor } from '../editor/createPlateRuntimeEditor';

type PlateFallbackEditor = {
  apply: () => never;
  children: Value;
  id: string;
  meta: {
    isFallback: boolean;
  };
  selection: Selection;
};

type FallbackRuntimeEditor = PlateRuntimeEditor & {
  apply: () => never;
};

export const createPlateFallbackEditor = (
  options: CreatePlateEditorRuntimeOptions = {}
): PlateFallbackEditor => {
  const editor = createPlateEditor(options);

  editor.meta.isFallback = true;

  (editor as unknown as FallbackRuntimeEditor).apply = () => {
    throw new Error(
      'Cannot apply operations on the fallback editor. The fallback editor is used when a hook that depends on the Plate store was unable to locate a valid store. If you are using PlateController, use `useEditorMounted(id?: string)` or `!editor.meta.isFallback` to ensure that a valid Plate store is available before attempting to call operations on the editor.'
    );
  };

  return editor as unknown as PlateFallbackEditor;
};
