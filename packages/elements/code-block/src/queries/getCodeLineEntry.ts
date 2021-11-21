import {
  getAbove,
  getParent,
  isElement,
  PlateEditor,
  someNode,
} from '@udecode/plate-core';
import { Location } from 'slate';
import { getCodeLineType } from '../options';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeLineEntry = (
  editor: PlateEditor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: { type: getCodeLineType(editor) },
    })
  ) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, parentPath] = selectionParent;

    const codeLine =
      getAbove(editor, {
        at,
        match: { type: getCodeLineType(editor) },
      }) || getParent(editor, parentPath);

    if (!codeLine) return;
    const [codeLineNode, codeLinePath] = codeLine;

    if (
      isElement(codeLineNode) &&
      codeLineNode.type !== getCodeLineType(editor)
    )
      return;

    const codeBlock = getParent(editor, codeLinePath);
    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine,
    };
  }
};
