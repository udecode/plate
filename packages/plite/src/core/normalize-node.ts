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
  TextApi,
  type Value,
} from '../interfaces';
import { getChildren as editorGetChildren } from '../interfaces/editor';
import type { Editor } from '../interfaces/editor';
import type { Operation } from '../interfaces/operation';
import {
  insertNodes,
  mergeNodes,
  removeNodes,
  wrapNodes,
} from '../transforms-node';
import { getEditorSchema } from './editor-runtime';
import { getExtensionRegistry } from './extension-registry';
import { getNormalizerUpdateView } from './public-state';

export type InternalEditorNormalizeNodeOptions = EditorNormalizeNodeOptions & {
  operation?: Operation;
};

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

const normalizeInlineChildren = (
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

const normalizeAffectedInlineChildren = (
  editor: Editor,
  node: Editor | Element,
  path: readonly number[],
  childIndexes: readonly number[]
) => {
  const children = getNodeChildren(editor, node);
  const affected = new Set(childIndexes);

  for (const index of [...affected].sort((left, right) => right - left)) {
    const child = children[index];

    if (!child || isTextChild(child) || isInlineChild(editor, child)) {
      continue;
    }

    const replacement = collectInlineCompatibleDescendants(editor, child);

    removeNodes(editor, { at: [...path, index], voids: true });

    if (replacement.length > 0) {
      insertNodes(editor, replacement, { at: [...path, index], voids: true });
    }

    return true;
  }

  for (let index = 1; index < children.length; index += 1) {
    if (!affected.has(index) && !affected.has(index - 1)) continue;

    const child = children[index]!;
    const previous = children[index - 1]!;

    if (!isTextChild(child) || !isTextChild(previous)) continue;

    if (child.text === '') {
      removeNodes(editor, { at: [...path, index], voids: true });
      return true;
    }

    if (previous.text === '') {
      removeNodes(editor, { at: [...path, index - 1], voids: true });
      return true;
    }

    if (TextApi.equals(child, previous, { loose: true })) {
      mergeNodes(editor, { at: [...path, index], voids: true });
      return true;
    }
  }

  for (const [index, child] of children.entries()) {
    if (
      !isInlineChild(editor, child) ||
      (!affected.has(index) &&
        !affected.has(index - 1) &&
        !affected.has(index + 1))
    ) {
      continue;
    }

    const previous = children[index - 1];
    const next = children[index + 1];

    if (!previous || !isTextChild(previous)) {
      insertNodes(editor, { text: '' }, { at: [...path, index], voids: true });
      return true;
    }

    if (!next || !isTextChild(next)) {
      insertNodes(
        editor,
        { text: '' },
        { at: [...path, index + 1], voids: true }
      );
      return true;
    }
  }

  return false;
};

const isDirectChildPath = (
  parentPath: readonly number[],
  childPath: readonly number[]
) =>
  childPath.length === parentPath.length + 1 &&
  parentPath.every((segment, index) => segment === childPath[index]);

const getDirectChildIndexesToValidate = (
  path: readonly number[],
  operation?: Operation
) => {
  if (!operation) {
    return null;
  }

  switch (operation.type) {
    case 'insert_node':
    case 'insert_text':
    case 'remove_text':
    case 'set_node':
      return isDirectChildPath(path, operation.path)
        ? [operation.path[path.length]]
        : null;
    case 'remove_node':
      return isDirectChildPath(path, operation.path)
        ? [operation.path[path.length]]
        : null;
    case 'split_node':
      return isDirectChildPath(path, operation.path)
        ? [operation.path[path.length], operation.path[path.length] + 1]
        : null;
    case 'merge_node':
      return isDirectChildPath(path, operation.path)
        ? [Math.max(0, operation.path[path.length] - 1)]
        : null;
    case 'move_node': {
      const removesFromParent = isDirectChildPath(path, operation.path);
      const insertsIntoParent = isDirectChildPath(path, operation.newPath);

      if (!removesFromParent && !insertsIntoParent) {
        return null;
      }

      return [
        ...(removesFromParent ? [operation.path[path.length]] : []),
        ...(insertsIntoParent ? [operation.newPath[path.length]] : []),
      ];
    }
    default:
      return null;
  }
};

const normalizeNodeDefault = (
  editor: Editor,
  entry: NodeEntry,
  options: InternalEditorNormalizeNodeOptions = {}
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

  const directChildIndexes = getDirectChildIndexesToValidate(
    path,
    options.operation
  );
  const allowBroadBlockOnlyScan =
    Array.isArray(directChildIndexes) && directChildIndexes.length === 0;
  const nodeChildren = getNodeChildren(editor, node);

  if (shouldHaveInlineChildren(editor, node)) {
    if (directChildIndexes) {
      normalizeAffectedInlineChildren(editor, node, path, directChildIndexes);
    } else {
      normalizeInlineChildren(editor, node, path);
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
  options: InternalEditorNormalizeNodeOptions = {}
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

      normalizeNodeDefault(editor, entry, {
        ...nextOptions,
        operation: options.operation,
      });
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

  run(0, { entry, fallbackElement: options.fallbackElement });
};
