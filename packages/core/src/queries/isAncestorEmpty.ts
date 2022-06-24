import { isInline } from '../slate/editor/isInline';
import { TEditor, Value } from '../slate/editor/TEditor';
import { getNodeString } from '../slate/node/getNodeString';
import { TAncestor } from '../slate/node/TAncestor';

/**
 * Is an ancestor empty (empty text and no inline children).
 */
export const isAncestorEmpty = <V extends Value>(
  editor: TEditor<V>,
  node: TAncestor
) => !getNodeString(node) && !node.children.some((n) => isInline(editor, n));
