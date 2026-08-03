import type { Editor, EditorCommit, RuntimeId, Value } from '@platejs/plite';

import {
  getEditorRuntimeElementEntries,
  getEditorRuntimeOwner,
  getEditorRuntimeRootKeys,
} from './runtime-editor-api';
import { MAIN_ROOT_KEY } from '../root-key';

export const getSchemaInvalidatedRuntimeIds = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  commit: Pick<EditorCommit, 'dirtyStateKeys'>
): readonly RuntimeId[] => {
  if (!commit.dirtyStateKeys.includes('$configuration')) return [];

  return editor.read((state) => {
    const delta = state.schema.delta();

    if (!delta) return [];
    const runtimeIds = new Set<RuntimeId>();
    const runtimeOwner = getEditorRuntimeOwner(editor);
    const runtimeRoots = new Set(getEditorRuntimeRootKeys(runtimeOwner));

    if (delta.elementTypes.length > 0) {
      for (const root of runtimeRoots) {
        for (const entry of getEditorRuntimeElementEntries(
          runtimeOwner,
          delta.elementTypes,
          root
        )) {
          runtimeIds.add(entry.runtimeId);
        }
      }
    }

    if (delta.roots.length > 0) {
      const allElementTypes = state.schema.getVocabulary().elementTypes;

      for (const changedRoot of delta.roots) {
        const root = changedRoot ?? MAIN_ROOT_KEY;

        if (!runtimeRoots.has(root)) continue;
        for (const entry of getEditorRuntimeElementEntries(
          runtimeOwner,
          allElementTypes,
          root
        )) {
          if (entry.path.length === 1) runtimeIds.add(entry.runtimeId);
        }
      }
    }

    return [...runtimeIds];
  });
};
