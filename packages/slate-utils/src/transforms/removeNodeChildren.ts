import {
  getNodeChildren,
  removeNodes,
  RemoveNodesOptions,
  TEditor,
  Value,
  withoutNormalizing,
} from '@udecode/slate';
import { Path } from 'slate';

/**
 * Remove node children.
 */
export const removeNodeChildren = <V extends Value = Value>(
  editor: TEditor<V>,
  path: Path,
  options?: Omit<RemoveNodesOptions<V>, 'at'>
) => {
  withoutNormalizing(editor, () => {
    for (const [, childPath] of getNodeChildren(editor, path, {
      reverse: true,
    })) {
      removeNodes(editor, { ...options, at: childPath });
    }
  });
};
