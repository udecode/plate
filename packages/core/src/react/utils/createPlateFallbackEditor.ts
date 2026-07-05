import type { Selection, Value } from '@platejs/plite';

import { type CreatePlateEditorOptions, createPlateEditor } from '../editor';
import type { PlateEditor } from '../editor/PlateEditor';

type PlateFallbackEditor = {
  apply: () => never;
  children: Value;
  id: string;
  runtime: {
    isFallback: boolean;
  };
  selection: Selection;
};

type FallbackRuntimeEditor = PlateEditor & {
  apply: () => never;
};

export const createPlateFallbackEditor = (
  options: CreatePlateEditorOptions<Value, []> = {}
): PlateFallbackEditor => {
  const editor = (createPlateEditor as any)(options);

  editor.runtime.isFallback = true;

  (editor as unknown as FallbackRuntimeEditor).apply = () => {
    throw new Error(
      'Cannot apply operations on the fallback editor. The fallback editor is used when a hook that depends on the Plate store was unable to locate a valid store. If you are using PlateController, use `useEditorMounted(id?: string)` or `!editor.runtime.isFallback` to ensure that a valid Plate store is available before attempting to call operations on the editor.'
    );
  };

  return editor as unknown as PlateFallbackEditor;
};
