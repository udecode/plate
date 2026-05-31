import type {
  Descendant,
  Editor,
  LegacyEditorMethods,
  NodeProps,
  Path,
  SetNodeOperation,
} from '../../interfaces';
import { NodeApi } from '../../interfaces';

export type NodeBatchUpdate<N extends Descendant = Descendant> = {
  at: Path;
  props: Partial<NodeProps<N>>;
};

type BatchEditor = Editor & LegacyEditorMethods;

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

  const opKeys = new Set<string>();

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
  }

  editor.tf.withoutNormalizing(() => {
    for (const op of ops) {
      editor.apply(op);
    }
  });
};

export const setNodesBatch = <N extends Descendant>(
  editor: BatchEditor,
  updates: NodeBatchUpdate<N>[]
) => {
  const ops = buildSetNodeBatchOperations(editor, updates);

  applySetNodeBatchOperations(editor, ops);
};
