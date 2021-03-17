import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';
import { ELEMENT_CODE_LINE } from '../defaults';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeLineEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: { type: getPluginType(editor, ELEMENT_CODE_LINE) },
    })
  ) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, parentPath] = selectionParent;

    const codeLine =
      getAbove(editor, {
        at,
        match: { type: getPluginType(editor, ELEMENT_CODE_LINE) },
      }) || getParent(editor, parentPath);

    if (!codeLine) return;
    const [codeLineNode, codeLinePath] = codeLine;

    if (codeLineNode.type !== getPluginType(editor, ELEMENT_CODE_LINE)) return;

    const codeBlock = getParent(editor, codeLinePath);
    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine,
    };
  }
};
