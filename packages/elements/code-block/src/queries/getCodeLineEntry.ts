import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  isElement,
  SPEditor,
} from '@udecode/slate-plugins-core';
import { Location } from 'slate';
import { ELEMENT_CODE_LINE } from '../defaults';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeLineEntry = (
  editor: SPEditor,
  { at = editor.selection }: { at?: Location | null } = {}
) => {
  if (
    at &&
    someNode(editor, {
      at,
      match: { type: getSlatePluginType(editor, ELEMENT_CODE_LINE) },
    })
  ) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, parentPath] = selectionParent;

    const codeLine =
      getAbove(editor, {
        at,
        match: { type: getSlatePluginType(editor, ELEMENT_CODE_LINE) },
      }) || getParent(editor, parentPath);

    if (!codeLine) return;
    const [codeLineNode, codeLinePath] = codeLine;

    if (
      isElement(codeLineNode) &&
      codeLineNode.type !== getSlatePluginType(editor, ELEMENT_CODE_LINE)
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
