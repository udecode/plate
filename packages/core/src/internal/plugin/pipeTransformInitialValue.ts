import type { BaseEditor } from '../../lib/editor';
import {
  DocumentChange,
  ElementApi,
  type EditorDocumentValue,
  type Editor as PliteEditor,
  type Path,
  type Selection,
  type SnapshotIndex,
  type Value,
} from '@platejs/plite';
import {
  MAIN_ROOT_KEY,
  mapSelectionThroughChange,
  runTrustedUpdate,
} from '@platejs/plite/internal';

import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import type { AnyBasePluginDefinition } from '../../lib/plugin/PluginDefinition';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';
import { isEditOnly } from './isEditOnlyDisabled';

const getSharedNodeIndexes = (
  before: Value,
  after: Value
): Readonly<{ after: SnapshotIndex; before: SnapshotIndex }> => {
  const afterEntries: Array<readonly [string, Path]> = [];
  const beforeEntries: Array<readonly [string, Path]> = [];
  const ids = new WeakMap<object, string>();
  let nextId = 0;
  const visitBefore = (nodes: Value[number]['children'], parent: number[]) => {
    nodes.forEach((node, index) => {
      const path = [...parent, index];
      const id = `initial:${nextId++}`;

      ids.set(node, id);
      beforeEntries.push([id, path]);
      if (ElementApi.isElement(node)) visitBefore(node.children, path);
    });
  };
  const visitAfter = (nodes: Value[number]['children'], parent: number[]) => {
    nodes.forEach((node, index) => {
      const path = [...parent, index];
      const id = ids.get(node);

      if (id) {
        afterEntries.push([id, path]);
      }
      if (ElementApi.isElement(node)) visitAfter(node.children, path);
    });
  };

  visitBefore(before, []);
  visitAfter(after, []);

  const createIndex = (
    entries: readonly (readonly [string, Path])[]
  ): SnapshotIndex => {
    const frozenEntries = Object.freeze(
      entries.map(([runtimeId, path]) =>
        Object.freeze([runtimeId, Object.freeze([...path]) as Path] as const)
      )
    );
    const byId = new Map(frozenEntries);
    const byPath = new Map(
      frozenEntries.map(([runtimeId, path]) => [path.join('.'), runtimeId])
    );

    const index = {
      entries: () => frozenEntries,
      idAt: (path) => byPath.get(path.join('.')) ?? null,
      pathOf: (runtimeId) => byId.get(runtimeId) ?? null,
    } satisfies SnapshotIndex;

    return Object.freeze(index);
  };

  return {
    after: createIndex(afterEntries),
    before: createIndex(beforeEntries),
  };
};

/** Apply every enabled plugin transform to one detached document input. */
export const transformInitialValue = (
  editor: BaseEditor,
  initialValue: EditorDocumentValue,
  initialSelection: Selection = null,
  selectionRoot = MAIN_ROOT_KEY
) => {
  const wasNormalizing = editor.runtime.isNormalizing;
  let selection = initialSelection;
  let value = initialValue;

  editor.runtime.isNormalizing = true;
  try {
    getPlateRuntime(editor).pluginCache.transformInitialValue.forEach(
      (pluginName) => {
        const plugin = getCompiledPlatePlugin(editor, pluginName)!;

        if (
          isEditOnly(
            editor.read.view.isReadOnly(),
            plugin,
            'transformInitialValue'
          ) ||
          !plugin.transformInitialValue
        ) {
          return;
        }

        const nextValue = Reflect.apply(
          plugin.transformInitialValue,
          undefined,
          [
            {
              ...createPluginContext(editor, plugin),
              value,
            },
          ]
        );

        if (
          !nextValue ||
          Array.isArray(nextValue) ||
          !Array.isArray(nextValue.children)
        ) {
          throw new Error(
            `Plugin "${pluginName}" transformInitialValue must return an editor document with primary-root children.`
          );
        }

        if (selection) {
          const beforeChildren =
            selectionRoot === MAIN_ROOT_KEY
              ? value.children
              : (value.roots?.[selectionRoot] ?? []);
          const afterChildren =
            selectionRoot === MAIN_ROOT_KEY
              ? nextValue.children
              : (nextValue.roots?.[selectionRoot] ?? []);

          selection = mapSelectionThroughChange(
            editor,
            selection,
            DocumentChange.between(value, nextValue),
            value,
            nextValue,
            selectionRoot,
            {
              association: 'backward',
              preferPositionMapping: true,
              runtimeIndexes: getSharedNodeIndexes(
                beforeChildren,
                afterChildren
              ),
            }
          );
        }
        value = nextValue;
      }
    );

    return { selection, value };
  } finally {
    editor.runtime.isNormalizing = wasNormalizing;
  }
};

/** Reapply every document-input transform to the current document. */
export const pipeTransformInitialValue = <
  V extends Value,
  P extends AnyBasePluginDefinition,
>(
  editor: BaseEditor<V, P>
) => {
  runTrustedUpdate(editor as unknown as PliteEditor<V>, (tx) => {
    tx.value.replace({
      ...editor.read.value(),
      selection: editor.read.selection(),
    });
  });
};
