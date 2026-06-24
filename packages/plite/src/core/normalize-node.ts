import { node as getNode } from '../editor/node';
import {
  type Descendant,
  type EditorNodeNormalizerArgs,
  type EditorNodeNormalizerContext,
  type EditorNormalizeNodeOptions,
  type Element,
  ElementApi,
  NodeApi,
  type NodeEntry,
  type Operation,
  TextApi,
  type Value,
} from '../interfaces';
import { getChildren as editorGetChildren } from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import {
  insertNodes,
  mergeNodes,
  removeNodes,
  wrapNodes,
} from '../transforms-node';
import { getEditorSchema } from './editor-runtime';
import { getExtensionRegistry } from './extension-registry';
import { getNormalizerUpdateView } from './public-state';

const resolveFallbackElement = (
  fallbackElement: EditorNormalizeNodeOptions['fallbackElement']
) =>
  typeof fallbackElement === 'function' ? fallbackElement() : fallbackElement;

const getNodeChildren = (editor: Editor, node: Editor | Element) =>
  NodeApi.isEditor(node) ? editorGetChildren(editor) : node.children;

const shouldHaveInlineChildren = (editor: Editor, node: Editor | Element) => {
  if (NodeApi.isEditor(node)) {
    return false;
  }

  const firstChild = getNodeChildren(editor, node)[0];

  return (
    getEditorSchema(editor).isInline(node) ||
    TextApi.isText(firstChild) ||
    (ElementApi.isElement(firstChild) &&
      getEditorSchema(editor).isInline(firstChild))
  );
};

const isInlineChild = (editor: Editor, node: Descendant) =>
  ElementApi.isElement(node) && getEditorSchema(editor).isInline(node);

const isTextChild = (
  node: Descendant
): node is Extract<Descendant, { text: string }> => TextApi.isText(node);

const collectInlineCompatibleDescendants = (
  editor: Editor,
  node: Descendant
): Descendant[] => {
  if (TextApi.isText(node) || isInlineChild(editor, node)) {
    return [node];
  }

  return node.children.flatMap((child) =>
    collectInlineCompatibleDescendants(editor, child)
  );
};

const normalizeExplicitInlineChildren = (
  editor: Editor,
  node: Editor | Element,
  path: readonly number[]
) => {
  let didMutate = false;
  let currentNode: Editor | Element = node;

  const refreshNode = () => {
    currentNode = getNode(editor, [...path])[0] as Editor | Element;
  };

  while (true) {
    let mutatedThisRound = false;

    const currentChildren = getNodeChildren(editor, currentNode);

    for (let index = currentChildren.length - 1; index >= 0; index -= 1) {
      const child = currentChildren[index]!;

      if (isTextChild(child) || isInlineChild(editor, child)) {
        continue;
      }

      const replacement = collectInlineCompatibleDescendants(editor, child);

      removeNodes(editor, { at: [...path, index], voids: true });

      if (replacement.length > 0) {
        insertNodes(editor, replacement, { at: [...path, index], voids: true });
      }

      mutatedThisRound = true;
      didMutate = true;
    }

    if (mutatedThisRound) {
      refreshNode();
      continue;
    }

    const skippedIndexes = new Set<number>();

    for (let index = currentChildren.length - 1; index > 0; index -= 1) {
      if (skippedIndexes.has(index)) {
        continue;
      }

      const child = currentChildren[index]!;

      if (!isTextChild(child)) {
        continue;
      }

      const prevIndex = index - 1;

      if (skippedIndexes.has(prevIndex)) {
        continue;
      }

      const prev = currentChildren[prevIndex]!;

      if (!isTextChild(prev)) {
        continue;
      }

      if (child.text === '') {
        removeNodes(editor, { at: [...path, index], voids: true });
        skippedIndexes.add(index);
        mutatedThisRound = true;
        didMutate = true;
        continue;
      }

      if (prev.text === '') {
        removeNodes(editor, { at: [...path, prevIndex], voids: true });
        skippedIndexes.add(prevIndex);
        mutatedThisRound = true;
        didMutate = true;
        continue;
      }

      if (TextApi.equals(child, prev, { loose: true })) {
        mergeNodes(editor, { at: [...path, index], voids: true });
        skippedIndexes.add(index);
        mutatedThisRound = true;
        didMutate = true;
      }
    }

    if (mutatedThisRound) {
      refreshNode();
      continue;
    }

    const spacerInsertions = new Set<number>();

    for (const [index, child] of currentChildren.entries()) {
      if (!isInlineChild(editor, child)) {
        continue;
      }

      const prev = currentChildren[index - 1];
      const next = currentChildren[index + 1];

      if (!prev || !isTextChild(prev)) {
        spacerInsertions.add(index);
      }

      if (!next || !isTextChild(next)) {
        spacerInsertions.add(index + 1);
      }
    }

    if (spacerInsertions.size === 0) {
      return didMutate;
    }

    for (const index of Array.from(spacerInsertions).sort((a, b) => b - a)) {
      insertNodes(editor, { text: '' }, { at: [...path, index], voids: true });
    }

    refreshNode();
    didMutate = true;
  }
};

const isDirectChildPath = (
  parentPath: readonly number[],
  childPath: readonly number[]
) =>
  childPath.length === parentPath.length + 1 &&
  parentPath.every((segment, index) => segment === childPath[index]);

const getBlockOnlyChildIndexesToValidate = (
  path: readonly number[],
  operation?: Operation
) => {
  if (!operation) {
    return null;
  }

  switch (operation.type) {
    case 'set_node':
    case 'insert_node':
      return isDirectChildPath(path, operation.path)
        ? [operation.path[path.length]]
        : null;
    case 'remove_node':
      return isDirectChildPath(path, operation.path) ? [] : null;
    case 'move_node': {
      const removesFromParent = isDirectChildPath(path, operation.path);
      const insertsIntoParent = isDirectChildPath(path, operation.newPath);

      if (!removesFromParent && !insertsIntoParent) {
        return null;
      }

      if (removesFromParent && insertsIntoParent) {
        return [];
      }

      return insertsIntoParent ? [operation.newPath[path.length]] : [];
    }
    default:
      return null;
  }
};

const normalizeNodeDefault = (
  editor: Editor,
  entry: NodeEntry,
  options: EditorNormalizeNodeOptions = {}
) => {
  const { fallbackElement } = options;
  const [node, path] = entry;

  if (TextApi.isText(node)) {
    return;
  }

  if (!NodeApi.isEditor(node) && node.children.length === 0) {
    insertNodes(editor, { text: '' }, { at: [...path, 0] });
    return;
  }

  const directChildIndexes = getBlockOnlyChildIndexesToValidate(
    path,
    options.operation
  );
  const allowBroadBlockOnlyScan =
    Array.isArray(directChildIndexes) && directChildIndexes.length === 0;
  const nodeChildren = getNodeChildren(editor, node);

  if (shouldHaveInlineChildren(editor, node)) {
    if (
      options.explicit &&
      normalizeExplicitInlineChildren(editor, node, path)
    ) {
      return;
    }

    for (const [index, child] of nodeChildren.entries()) {
      const prev = nodeChildren[index - 1];
      const next = nodeChildren[index + 1];
      const touchesDirectChildCleanup =
        !options.explicit &&
        Array.isArray(directChildIndexes) &&
        (directChildIndexes.includes(index) ||
          directChildIndexes.includes(index - 1));
      const canCanonicalizeAdjacentText =
        options.explicit && !touchesDirectChildCleanup;

      if (TextApi.isText(child) && TextApi.isText(prev)) {
        if (
          canCanonicalizeAdjacentText &&
          child.text === '' &&
          (!next || TextApi.isText(next))
        ) {
          removeNodes(editor, { at: [...path, index], voids: true });
          return;
        }

        if (
          canCanonicalizeAdjacentText &&
          prev.text === '' &&
          (!nodeChildren[index - 2] || TextApi.isText(nodeChildren[index - 2]!))
        ) {
          removeNodes(editor, { at: [...path, index - 1], voids: true });
          return;
        }

        if (
          canCanonicalizeAdjacentText &&
          TextApi.equals(child, prev, { loose: true })
        ) {
          mergeNodes(editor, { at: [...path, index], voids: true });
          return;
        }
      }

      if (
        touchesDirectChildCleanup &&
        TextApi.isText(child) &&
        TextApi.isText(prev)
      ) {
        if (child.text === '') {
          removeNodes(editor, { at: [...path, index], voids: true });
          return;
        }

        if (prev.text === '') {
          removeNodes(editor, { at: [...path, index - 1], voids: true });
          return;
        }
      }

      if (
        Array.isArray(directChildIndexes) &&
        directChildIndexes.includes(index) &&
        !TextApi.isText(child) &&
        !isInlineChild(editor, child)
      ) {
        const replacement = collectInlineCompatibleDescendants(editor, child);

        removeNodes(editor, { at: [...path, index], voids: true });

        if (replacement.length > 0) {
          insertNodes(editor, replacement, {
            at: [...path, index],
            voids: true,
          });
        }

        return;
      }

      if (!isInlineChild(editor, child)) {
        continue;
      }

      if (!prev || !TextApi.isText(prev)) {
        insertNodes(
          editor,
          { text: '' },
          { at: [...path, index], voids: true }
        );
        return;
      }

      if (!next || !TextApi.isText(next)) {
        insertNodes(
          editor,
          { text: '' },
          { at: [...path, index + 1], voids: true }
        );
        return;
      }
    }

    return;
  }

  if (Array.isArray(directChildIndexes)) {
    if (directChildIndexes.length === 0) {
      if (!fallbackElement && options.operation) {
        // A direct-child remove/move can expose additional invalid siblings.
        // Fall through to the broader scan instead of exiting early.
      } else if (!fallbackElement) {
        return;
      }
    }

    for (const index of directChildIndexes) {
      const child = nodeChildren[index];

      if (!child || (!TextApi.isText(child) && !isInlineChild(editor, child))) {
        continue;
      }

      if (!fallbackElement) {
        removeNodes(editor, { at: [...path, index] });
        return;
      }

      const wrapper = resolveFallbackElement(fallbackElement);

      if (!wrapper) {
        return;
      }

      wrapNodes(editor, wrapper, {
        at: [...path, index],
      });
      return;
    }

    if (!fallbackElement && !allowBroadBlockOnlyScan) {
      return;
    }
  }

  if (!fallbackElement && options.operation && !allowBroadBlockOnlyScan) {
    return;
  }

  for (const [index, child] of getNodeChildren(editor, node).entries()) {
    if (!TextApi.isText(child) && !isInlineChild(editor, child)) {
      continue;
    }

    const wrapper = resolveFallbackElement(fallbackElement);

    if (!wrapper) {
      removeNodes(editor, { at: [...path, index] });
      return;
    }

    wrapNodes(editor, wrapper, {
      at: [...path, index],
    });
    return;
  }
};

export const normalizeNode = <V extends Value>(
  editor: Editor<V>,
  entry: NodeEntry,
  options: EditorNormalizeNodeOptions<V> = {}
) => {
  const normalizers = [...getExtensionRegistry(editor).normalizers.values()];

  if (normalizers.length === 0) {
    normalizeNodeDefault(editor, entry, options);
    return;
  }

  const tx = getNormalizerUpdateView(editor) as EditorNodeNormalizerContext<
    typeof editor
  >['tx'];

  const run = (index: number, currentArgs: EditorNodeNormalizerArgs) => {
    const normalizer = normalizers[index];

    if (!normalizer) {
      const { entry, ...nextOptions } = currentArgs;

      normalizeNodeDefault(editor, entry, nextOptions);
      return;
    }

    let delegated = false;

    normalizer({
      ...currentArgs,
      editor,
      next(overrides = {}) {
        if (delegated) {
          throw new Error('Normalizer next() cannot be called more than once.');
        }

        delegated = true;
        run(index + 1, {
          ...currentArgs,
          ...overrides,
        });
      },
      tx,
    });
  };

  run(0, { ...options, entry });
};
