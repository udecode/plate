import type { Editor, EditorCommit, NodeKey, Value } from '../..';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  getEditorRuntimeElementEntries,
  getEditorRuntimeOwner,
  getEditorRuntimeRootKeys,
} from './runtime-editor-api';

export const getSchemaInvalidatedNodeKeys = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  commit: Pick<EditorCommit, 'dirtyStateKeys'>
): readonly NodeKey[] => {
  if (!commit.dirtyStateKeys.includes('$configuration')) return [];

  return editor.read((state) => {
    const delta = state.schema.delta();

    if (!delta) return [];
    const nodeKeys = new Set<NodeKey>();
    const runtimeOwner = getEditorRuntimeOwner(editor);
    const runtimeRoots = new Set(getEditorRuntimeRootKeys(runtimeOwner));

    if (delta.elementTypes.length > 0) {
      for (const root of runtimeRoots) {
        for (const entry of getEditorRuntimeElementEntries(
          runtimeOwner,
          delta.elementTypes,
          root
        )) {
          nodeKeys.add(entry.nodeKey);
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
          if (entry.path.length === 1) nodeKeys.add(entry.nodeKey);
        }
      }
    }

    return [...nodeKeys];
  });
};
