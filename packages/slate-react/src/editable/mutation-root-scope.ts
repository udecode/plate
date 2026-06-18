import type { Operation, RootKey } from '@platejs/slate';
import {
  type Editor as RuntimeEditor,
  withOperationRootChildren,
} from './runtime-editor-api';

export const withProjectedMutationRoot = <T>(
  editor: RuntimeEditor,
  root: RootKey | undefined,
  fn: () => T
): T => {
  if (!root) {
    return fn();
  }

  const rootPoint = { offset: 0, path: [0, 0], root };

  return withOperationRootChildren(
    editor,
    {
      newProperties: null,
      properties: { anchor: rootPoint, focus: rootPoint },
      root,
      type: 'set_selection',
    } as Operation,
    fn
  );
};
