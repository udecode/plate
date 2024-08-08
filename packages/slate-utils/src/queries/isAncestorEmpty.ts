import {
  type TAncestor,
  type TEditor,
  getNodeString,
  isInline,
} from '@udecode/slate';

/** Is an ancestor empty (empty text and no inline children). */
export const isAncestorEmpty = (editor: TEditor, node: TAncestor) =>
  !getNodeString(node) && !node.children.some((n) => isInline(editor, n));
