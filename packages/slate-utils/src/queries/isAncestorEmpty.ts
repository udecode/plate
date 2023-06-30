import {
  TAncestor,
  TEditor,
  Value,
  getNodeString,
  isInline,
} from '@udecode/slate';

/**
 * Is an ancestor empty (empty text and no inline children).
 */
export const isAncestorEmpty = <V extends Value>(
  editor: TEditor<V>,
  node: TAncestor
) => !getNodeString(node) && !node.children.some((n) => isInline(editor, n));
