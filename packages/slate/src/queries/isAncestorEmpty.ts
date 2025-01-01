import type { TAncestor, TEditor } from '../interfaces';

/** Is an ancestor empty (empty text and no inline children). */
export const isAncestorEmpty = (editor: TEditor, node: TAncestor) =>
  !editor.api.string(node) && !node.children.some((n) => editor.isInline(n));
