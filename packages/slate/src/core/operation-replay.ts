import type { Operation } from '../interfaces/operation';

const KNOWN_OPERATION_TYPES = new Set([
  'insert_node',
  'insert_text',
  'merge_node',
  'move_node',
  'remove_node',
  'remove_text',
  'replace_children',
  'replace_fragment',
  'set_node',
  'set_selection',
  'split_node',
]);

const INTERNAL_OWNED_REPLAY_OPERATIONS = new WeakSet<Operation>();

export const assertKnownReplayOperation = (operation: unknown) => {
  const value = operation as { root?: unknown; type?: unknown } | null;
  const type = value?.type;

  if (typeof type === 'string' && KNOWN_OPERATION_TYPES.has(type)) {
    if (value?.root !== undefined && typeof value.root !== 'string') {
      throw new Error(`Cannot replay an invalid Slate operation: "${type}".`);
    }

    return;
  }

  const label = typeof type === 'string' ? `"${type}"` : 'unknown';

  throw new Error(`Cannot replay an unknown Slate operation: ${label}.`);
};

export const markInternalOwnedReplayOperation = <T extends Operation>(
  operation: T
): T => {
  INTERNAL_OWNED_REPLAY_OPERATIONS.add(operation);

  return operation;
};

export const consumeInternalOwnedReplayOperation = (operation: Operation) => {
  const isInternalOwnedReplay = INTERNAL_OWNED_REPLAY_OPERATIONS.has(operation);
  INTERNAL_OWNED_REPLAY_OPERATIONS.delete(operation);

  return isInternalOwnedReplay;
};
