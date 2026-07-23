import type { BaseEditor } from '../../lib/editor';
import {
  DocumentChange,
  ElementApi,
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

import { getEditorPlugin } from '../../lib/plugin';
import { getPlateRuntime } from './compilePlateModel';
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

/** Apply every enabled plugin transform to a detached initial value. */
export const transformInitialValue = (
  editor: BaseEditor,
  initialValue: Value,
  initialSelection: Selection = null
) => {
  const wasNormalizing = editor.runtime.isNormalizing;
  let selection = initialSelection;
  let value = initialValue;

  editor.runtime.isNormalizing = true;
  try {
    getPlateRuntime(editor).pluginCache.transformInitialValue.forEach((key) => {
      const plugin = editor.getPlugin({ key });

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

      const nextValue = plugin.transformInitialValue({
        ...getEditorPlugin(editor, plugin),
        value,
      } as any);

      if (nextValue === undefined) {
        throw new Error(
          `Plugin "${key}" transformInitialValue must return the next value.`
        );
      }

      if (selection) {
        selection = mapSelectionThroughChange(
          editor,
          selection,
          DocumentChange.between({ children: value }, { children: nextValue }),
          { children: value },
          { children: nextValue },
          MAIN_ROOT_KEY,
          {
            association: 'backward',
            preferPositionMapping: true,
            runtimeIndexes: getSharedNodeIndexes(value, nextValue),
          }
        );
      }
      value = nextValue;
    });

    return { selection, value };
  } finally {
    editor.runtime.isNormalizing = wasNormalizing;
  }
};

/** Transform the current value from editor plugins before the editor is ready. */
export const pipeTransformInitialValue = (editor: BaseEditor) => {
  const transformed = transformInitialValue(
    editor,
    [...editor.read.children()],
    editor.read.selection()
  );

  runTrustedUpdate(editor, (tx) => {
    tx.value.replace({
      children: transformed.value,
      selection: transformed.selection,
    });
  });
};
