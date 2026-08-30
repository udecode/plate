import {
  DocumentChange,
  ElementApi,
  type EditorDocumentValue,
  type Editor as PliteEditor,
  type Path,
  type NodeKey,
  type Selection,
  type SnapshotIndex,
  type Value,
  MAIN_ROOT_KEY,
  mapSelectionThroughChange,
  readEditorSelection,
  runTrustedUpdate,
} from 'plitejs';

import type {
  Editor,
  InternalBaseEditorWithInstalledPlugins,
} from '../../lib/editor';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import type { AnyBasePluginDefinition } from '../../lib/plugin/PluginDefinition';
import { failInvariant } from '../failInvariant';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';
import { isEditOnly } from './isEditOnlyDisabled';

const getSharedNodeIndexes = (
  before: Value,
  after: Value
): Readonly<{ after: SnapshotIndex; before: SnapshotIndex }> => {
  const afterEntries: Array<readonly [NodeKey, Path]> = [];
  const beforeEntries: Array<readonly [NodeKey, Path]> = [];
  const keys = new WeakMap<object, NodeKey>();
  let nextKey = 0;
  const visitBefore = (nodes: Value[number]['children'], parent: number[]) => {
    nodes.forEach((node, index) => {
      const path = [...parent, index];
      const key = `initial:${nextKey}` as NodeKey;

      nextKey += 1;

      keys.set(node, key);
      beforeEntries.push([key, path]);
      if (ElementApi.isElement(node)) visitBefore(node.children, path);
    });
  };
  const visitAfter = (nodes: Value[number]['children'], parent: number[]) => {
    nodes.forEach((node, index) => {
      const path = [...parent, index];
      const key = keys.get(node);

      if (key) {
        afterEntries.push([key, path]);
      }
      if (ElementApi.isElement(node)) visitAfter(node.children, path);
    });
  };

  visitBefore(before, []);
  visitAfter(after, []);

  const createIndex = (
    entries: ReadonlyArray<readonly [NodeKey, Path]>
  ): SnapshotIndex => {
    const frozenEntries = Object.freeze(
      entries.map(([nodeKey, path]) =>
        Object.freeze([nodeKey, Object.freeze([...path])] as const)
      )
    );
    const byKey = new Map(frozenEntries);
    const byPath = new Map(
      frozenEntries.map(([nodeKey, path]) => [path.join('.'), nodeKey])
    );

    const index = {
      entries: () => frozenEntries,
      keyAt: (path) => byPath.get(path.join('.')) ?? null,
      pathOf: (nodeKey) => byKey.get(nodeKey) ?? null,
    } satisfies SnapshotIndex;

    return Object.freeze(index);
  };

  return {
    after: createIndex(afterEntries),
    before: createIndex(beforeEntries),
  };
};

export const mapDocumentSelection = (
  editor: Editor,
  selection: Selection,
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  root = MAIN_ROOT_KEY
) => {
  if (!selection || before === after) return selection;

  const beforeChildren =
    root === MAIN_ROOT_KEY ? before.children : (before.roots?.[root] ?? []);
  const afterChildren =
    root === MAIN_ROOT_KEY ? after.children : (after.roots?.[root] ?? []);

  return mapSelectionThroughChange(
    editor,
    selection,
    DocumentChange.between(before, after),
    before,
    after,
    root,
    {
      association: 'backward',
      preferPositionMapping: true,
      runtimeIndexes: getSharedNodeIndexes(beforeChildren, afterChildren),
    }
  );
};

/** Apply every enabled plugin preparation to one detached document input. */
export const prepareDocument = (
  editor: Editor,
  input: EditorDocumentValue,
  initialSelection: Selection = null,
  selectionRoot = MAIN_ROOT_KEY
) => {
  const wasNormalizing = editor.runtime.isNormalizing;
  let selection = initialSelection;
  let document = input;

  editor.runtime.isNormalizing = true;
  try {
    getPlateRuntime(editor).pluginCache.prepareDocument.forEach((name) => {
      const plugin =
        getCompiledPlatePlugin(editor, name) ??
        failInvariant('Expected value to be defined');

      if (
        isEditOnly(editor.read.view.isReadOnly(), plugin, 'prepareDocument') ||
        !plugin.prepareDocument
      ) {
        return;
      }

      const nextDocument = Reflect.apply(plugin.prepareDocument, undefined, [
        {
          ...createPluginContext(editor, plugin),
          document,
        },
      ]);

      if (
        !nextDocument ||
        Array.isArray(nextDocument) ||
        !Array.isArray(nextDocument.children)
      ) {
        throw new Error(
          `Plugin "${name}" prepareDocument must return an editor document with primary-root children.`
        );
      }

      selection = mapDocumentSelection(
        editor,
        selection,
        document,
        nextDocument,
        selectionRoot
      );
      document = nextDocument;
    });

    return { document, selection };
  } finally {
    editor.runtime.isNormalizing = wasNormalizing;
  }
};

/** Reapply installed-plugin preparation to the current document. */
export const pipePrepareDocument = <
  V extends Value,
  P extends AnyBasePluginDefinition,
>(
  editor: InternalBaseEditorWithInstalledPlugins<V, P>
) => {
  runTrustedUpdate(editor as unknown as PliteEditor<V>, (tx) => {
    tx.value.replace({
      document: editor.read.value(),
      schema: editor.read.schema.identity(),
      selection: readEditorSelection(editor),
    });
  });
};
