import type { Operation } from '../interfaces/operation';
import { getExplicitRangeRoot, MAIN_ROOT_KEY } from './public-root';

type RootPresenceLookup = (root: string) => boolean;

const getExplicitSelectionOperationRoot = (
  operation: Operation
): string | undefined => {
  if (operation.type !== 'set_selection') {
    return;
  }

  return operation.newProperties === null
    ? getExplicitRangeRoot(operation.properties)
    : getExplicitRangeRoot(operation.newProperties);
};

export const withDefaultOperationRoot = (
  operation: Operation,
  activeRoot: string | undefined
): Operation => {
  switch (operation.type) {
    case 'insert_node':
    case 'insert_text':
    case 'merge_node':
    case 'move_node':
    case 'remove_node':
    case 'remove_text':
    case 'replace_children':
    case 'replace_fragment':
    case 'set_node':
    case 'set_selection':
    case 'split_node':
      return operation.root === undefined
        ? {
            ...operation,
            root:
              getExplicitSelectionOperationRoot(operation) ??
              activeRoot ??
              MAIN_ROOT_KEY,
          }
        : operation;
    default:
      return operation;
  }
};

export const withReplayOperationDefaultRoot = (
  operation: Operation
): Operation => {
  switch (operation.type) {
    case 'insert_node':
    case 'insert_text':
    case 'merge_node':
    case 'move_node':
    case 'remove_node':
    case 'remove_text':
    case 'replace_children':
    case 'replace_fragment':
    case 'set_node':
    case 'set_selection':
    case 'split_node':
      return operation.root === undefined &&
        getExplicitSelectionOperationRoot(operation) === undefined
        ? { ...operation, root: MAIN_ROOT_KEY }
        : operation;
    default:
      return operation;
  }
};

export const getPublicStateOperationRoot = (
  operation: Operation
): string | null => {
  switch (operation.type) {
    case 'insert_node':
    case 'insert_text':
    case 'merge_node':
    case 'move_node':
    case 'remove_node':
    case 'remove_text':
    case 'replace_children':
    case 'replace_fragment':
    case 'set_node':
    case 'set_selection':
    case 'split_node':
      return operation.root ?? MAIN_ROOT_KEY;
    default:
      return null;
  }
};

export const withRootLifecycleDefaults = (
  operation: Operation,
  hasRoot: RootPresenceLookup
): Operation => {
  if (
    operation.type !== 'replace_children' ||
    operation.path.length > 0 ||
    operation.root === undefined ||
    operation.root === MAIN_ROOT_KEY
  ) {
    return operation;
  }

  const rootWasPresent = operation.rootWasPresent ?? hasRoot(operation.root);

  return {
    ...operation,
    rootIsPresent: operation.rootIsPresent ?? true,
    rootWasPresent,
  };
};
