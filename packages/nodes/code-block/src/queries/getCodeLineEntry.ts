import {
  EElement,
  getAboveNode,
  getParentNode,
  isElement,
  PlateEditor,
  someNode,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { Location } from 'slate';
import { getCodeLineType } from '../options';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeLineEntry = <
  N extends EElement<V>,
  V extends Value = Value
>(
  editor: PlateEditor<V>,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: { type: getCodeLineType(editor) },
    })
  ) {
    const selectionParent = getParentNode(editor, at);
    if (!selectionParent) return;
    const [, parentPath] = selectionParent;

    const codeLine =
      getAboveNode<TElement>(editor, {
        at,
        match: { type: getCodeLineType(editor) },
      }) || getParentNode<N>(editor, parentPath);

    if (!codeLine) return;
    const [codeLineNode, codeLinePath] = codeLine;

    if (
      isElement(codeLineNode) &&
      codeLineNode.type !== getCodeLineType(editor)
    )
      return;

    const codeBlock = getParentNode<N>(editor, codeLinePath);
    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine: codeLine as TNodeEntry<N>,
    };
  }
};
