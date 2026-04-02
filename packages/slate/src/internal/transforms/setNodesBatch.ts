import type {
  Descendant,
  Editor,
  LegacyEditorMethods,
  NodeProps,
  Operation,
  Path,
  SetNodeOperation,
} from '../../interfaces';
import { ElementApi, NodeApi, PathApi } from '../../interfaces';

export type NodeBatchUpdate<N extends Descendant = Descendant> = {
  at: Path;
  props: Partial<NodeProps<N>>;
};

type BatchTreeNode = {
  children: Map<number, BatchTreeNode>;
  op?: SetNodeOperation;
};

type BatchEditor = Editor & LegacyEditorMethods;

const createBatchTreeNode = (): BatchTreeNode => ({
  children: new Map(),
});

const applySetNodeOperation = (
  node: Descendant,
  op: SetNodeOperation
): Descendant => {
  const nextNode = { ...node } as Record<string, unknown>;

  for (const key in op.newProperties) {
    if (!Object.hasOwn(op.newProperties, key)) continue;

    if (key === 'children' || key === 'text') {
      throw new Error(`Cannot set the "${key}" property of nodes.`);
    }

    nextNode[key] = op.newProperties[key];
  }

  for (const key in op.properties) {
    if (!Object.hasOwn(op.properties, key)) continue;

    if (!Object.hasOwn(op.newProperties, key)) {
      delete nextNode[key];
    }
  }

  return nextNode as Descendant;
};

const applyBatchToNode = (
  node: Descendant,
  branch: BatchTreeNode
): Descendant => {
  let nextNode = node;

  if (branch.children.size > 0) {
    if (!ElementApi.isElement(node)) {
      throw new Error(
        `Cannot apply batched node updates beneath non-element node at path [${
          branch.op?.path.join(',') ?? ''
        }].`
      );
    }

    const nextChildren = node.children.slice();
    let hasChildChanges = false;

    for (const [index, childBranch] of branch.children) {
      const child = node.children[index];

      if (!child) {
        throw new Error(
          `Cannot apply batched set_node operations because path [${index}] does not exist in the current branch.`
        );
      }

      const nextChild = applyBatchToNode(child, childBranch);

      if (nextChild !== child) {
        nextChildren[index] = nextChild;
        hasChildChanges = true;
      }
    }

    if (hasChildChanges) {
      nextNode = {
        ...nextNode,
        children: nextChildren,
      } as Descendant;
    }
  }

  if (branch.op) {
    nextNode = applySetNodeOperation(nextNode, branch.op);
  }

  return nextNode;
};

const normalizeDirtyPaths = (
  editor: BatchEditor,
  initialDirtyPaths: Path[],
  operation: Operation | undefined
) => {
  let dirtyPaths = [...initialDirtyPaths];
  let dirtyPathKeys = new Set(dirtyPaths.map((path) => path.join(',')));
  const originalApply = editor.apply;

  const addDirtyPath = (path: Path | null) => {
    if (!path) return;

    const key = path.join(',');

    if (dirtyPathKeys.has(key)) return;

    dirtyPathKeys.add(key);
    dirtyPaths.push(path);
  };

  const appendDirtyPaths = (nextDirtyPaths: Path[], op?: Operation) => {
    if (op && PathApi.operationCanTransformPath(op)) {
      const transformedPaths: Path[] = [];
      const transformedKeys = new Set<string>();

      for (const path of dirtyPaths) {
        const nextPath = PathApi.transform(path, op);

        if (!nextPath) continue;

        const key = nextPath.join(',');

        if (transformedKeys.has(key)) continue;

        transformedKeys.add(key);
        transformedPaths.push(nextPath);
      }

      dirtyPaths = transformedPaths;
      dirtyPathKeys = transformedKeys;
    }

    nextDirtyPaths.forEach(addDirtyPath);
  };

  const popDirtyPath = () => {
    const path = dirtyPaths.pop()!;
    dirtyPathKeys.delete(path.join(','));

    return path;
  };

  editor.apply = ((op: Operation) => {
    appendDirtyPaths(editor.getDirtyPaths(op), op);
    originalApply(op);
  }) as BatchEditor['apply'];

  try {
    for (const dirtyPath of [...dirtyPaths]) {
      if (!NodeApi.has(editor, dirtyPath)) continue;

      const entry = editor.api.node(dirtyPath);

      if (!entry) continue;

      const [node] = entry;

      if (ElementApi.isElement(node) && node.children.length === 0) {
        editor.normalizeNode(entry, { operation });
      }
    }

    const initialDirtyPathsLength = dirtyPaths.length;
    let iteration = 0;

    while (dirtyPaths.length > 0) {
      if (
        !editor.shouldNormalize({
          dirtyPaths,
          initialDirtyPathsLength,
          iteration,
          operation,
        })
      ) {
        return;
      }

      const dirtyPath = popDirtyPath();

      if (!NodeApi.has(editor, dirtyPath)) {
        iteration++;
        continue;
      }

      const entry = editor.api.node(dirtyPath);

      if (entry) {
        editor.normalizeNode(entry, { operation });
      }

      iteration++;
    }
  } finally {
    editor.apply = originalApply;
  }
};

export const buildSetNodeBatchOperations = <N extends Descendant>(
  editor: BatchEditor,
  updates: NodeBatchUpdate<N>[]
) => {
  const ops: SetNodeOperation[] = [];

  for (const { at, props } of updates) {
    if (at.length === 0) {
      throw new Error('Cannot set properties on the root node.');
    }

    const node = NodeApi.get(editor, at);

    if (!node || !NodeApi.isDescendant(node)) {
      throw new Error(
        `Cannot build batched set_node operations because path [${at.join(',')}] does not exist.`
      );
    }

    const properties: Record<string, unknown> = {};
    const newProperties: Record<string, unknown> = {};
    let hasChanges = false;

    for (const key in props) {
      if (!Object.hasOwn(props, key)) continue;

      if (key === 'children' || key === 'text') continue;

      const value = props[key];
      const currentValue = node[key as keyof Descendant];

      if (value === currentValue) continue;

      hasChanges = true;

      if (Object.hasOwn(node, key)) {
        properties[key] = currentValue;
      }

      if (value != null) {
        newProperties[key] = value;
      }
    }

    if (!hasChanges) continue;

    ops.push({
      type: 'set_node',
      path: at,
      properties,
      newProperties,
    });
  }

  return ops;
};

export const applySetNodeBatchOperations = (
  editor: BatchEditor,
  ops: SetNodeOperation[]
) => {
  if (ops.length === 0) return;

  const dirtyPaths: Path[] = [];
  const dirtyPathKeys = new Set<string>();
  const root = createBatchTreeNode();
  const opKeys = new Set<string>();
  const wasNormalizing = editor.api.isNormalizing();
  const shouldFlush = editor.operations.length === 0;

  const addDirtyPath = (path: Path) => {
    const key = path.join(',');

    if (dirtyPathKeys.has(key)) return;

    dirtyPathKeys.add(key);
    dirtyPaths.push(path);
  };

  for (const op of ops) {
    if (op.path.length === 0) {
      throw new Error('Cannot set properties on the root node.');
    }

    const opKey = op.path.join(',');

    if (opKeys.has(opKey)) {
      throw new Error(
        `setNodesBatch does not support duplicate update paths. Duplicate path: [${op.path.join(',')}]`
      );
    }

    opKeys.add(opKey);

    let branch = root;

    for (const index of op.path) {
      let child = branch.children.get(index);

      if (!child) {
        child = createBatchTreeNode();
        branch.children.set(index, child);
      }

      branch = child;
    }

    branch.op = op;

    PathApi.levels(op.path).forEach(addDirtyPath);
  }

  editor.setNormalizing(false);

  try {
    const nextChildren = editor.children.slice();
    let hasChanges = false;

    for (const [index, branch] of root.children) {
      const child = editor.children[index];

      if (!child) {
        throw new Error(
          `Cannot apply batched set_node operations because top-level path [${index}] does not exist.`
        );
      }

      const nextChild = applyBatchToNode(child, branch) as typeof child;

      if (nextChild !== child) {
        nextChildren[index] = nextChild;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      editor.children = nextChildren as typeof editor.children;
    }

    editor.operations.push(...ops);

    if (wasNormalizing) {
      normalizeDirtyPaths(editor, dirtyPaths, ops.at(-1));
    }
  } finally {
    editor.setNormalizing(wasNormalizing);
  }

  if (wasNormalizing) {
    editor.tf.normalize({ operation: ops.at(-1) });
  }

  if (shouldFlush && editor.operations.length === ops.length) {
    Promise.resolve().then(() => {
      editor.onChange();
      editor.operations = [];
    });
  }
};

export const setNodesBatch = <N extends Descendant>(
  editor: BatchEditor,
  updates: NodeBatchUpdate<N>[]
) => {
  const ops = buildSetNodeBatchOperations(editor, updates);

  applySetNodeBatchOperations(editor, ops);
};
