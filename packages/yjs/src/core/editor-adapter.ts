import type {
  Descendant,
  Editor,
  Element,
  Operation,
  Range,
} from '@platejs/plite';
import { createEditor, NodeApi, OperationApi } from '@platejs/plite';
import { Editor as EditorApi } from '@platejs/plite/internal';

export type YjsEditorAdapter = {
  readonly importing: () => boolean;
  readonly readChildren: () => Element[];
  readonly readChildrenBeforeOperations: (
    operations: readonly Operation[]
  ) => Element[];
  readonly replaceValue: (
    children: readonly Descendant[],
    selection: Range | null
  ) => void;
};

const remoteImportOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'remote-yjs-import'],
} as const;

const remoteNormalizedImportOptions = {
  ...remoteImportOptions,
  skipNormalize: true,
} as const;

const SELECTION_ROOT_TYPE = 'plite-yjs-selection-root';

const copyReadonlyArray = <T>(items: readonly T[]): T[] => {
  const copy = new Array<T>(items.length);

  let index = 0;

  while (index < items.length) {
    const item = items[index];

    if (item === undefined) {
      throw new Error('Cannot copy a sparse array.');
    }

    copy[index] = item;
    index++;
  }

  return copy;
};

const sanitizeImportSelection = (
  children: readonly Descendant[],
  selection: Range | null
): Range | null => {
  if (selection === null) {
    return null;
  }

  // Selection validation is read-only; avoid a second shallow copy of large
  // remote imports before the actual replace payload is copied.
  const root: Element = {
    children: children as Element['children'],
    type: SELECTION_ROOT_TYPE,
  };

  return isValidImportSelectionPoint(root, selection.anchor) &&
    isValidImportSelectionPoint(root, selection.focus)
    ? selection
    : null;
};

const canSkipRemoteImportNormalize = (
  children: readonly Descendant[]
): boolean => children.every((child) => NodeApi.isElement(child));

const isValidImportSelectionPoint = (
  root: Element,
  point: Range['anchor']
): boolean => {
  const node = NodeApi.getIf(root, point.path);

  return (
    node !== undefined &&
    NodeApi.isText(node) &&
    point.offset >= 0 &&
    point.offset <= node.text.length
  );
};

export const createYjsEditorAdapter = (editor: Editor): YjsEditorAdapter => {
  let importing = false;

  const readChildren = (): Element[] =>
    editor.read((state) => copyReadonlyArray(state.value.get().children));

  const readChildrenBeforeOperations = (
    operations: readonly Operation[]
  ): Element[] => {
    const baselineEditor = createEditor();

    EditorApi.replace(baselineEditor, {
      children: readChildren(),
      marks: null,
      selection: null,
    });
    baselineEditor.update((tx) => {
      const inverseOperations = new Array<Operation>(operations.length);
      let inverseOperationCount = 0;

      let index = operations.length - 1;

      while (index >= 0) {
        const operation = operations[index];

        if (operation !== undefined) {
          inverseOperations[inverseOperationCount] =
            OperationApi.inverse(operation);
          inverseOperationCount++;
        }
        index--;
      }

      inverseOperations.length = inverseOperationCount;
      tx.operations.replay(inverseOperations);
    });

    return EditorApi.getSnapshot(baselineEditor).children;
  };

  const replaceValue = (
    children: readonly Descendant[],
    selection: Range | null
  ): void => {
    const nextSelection = sanitizeImportSelection(children, selection);

    importing = true;

    try {
      editor.update(
        (tx) => {
          tx.value.replace({
            children: copyReadonlyArray(children),
            marks: null,
            selection: nextSelection,
          });
        },
        canSkipRemoteImportNormalize(children)
          ? remoteNormalizedImportOptions
          : remoteImportOptions
      );
    } finally {
      importing = false;
    }
  };

  return {
    importing: () => importing,
    readChildren,
    readChildrenBeforeOperations,
    replaceValue,
  };
};
