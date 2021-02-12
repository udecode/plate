import { Editor, Location } from 'slate';
import { getAbove } from '../../../common/queries/getAbove';
import { getParent } from '../../../common/queries/getParent';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockLineOptions } from '../types';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeBlockLineItemEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options?: CodeBlockLineOptions
) => {
  const { code_block_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  if (at && someNode(editor, { at, match: { type: code_block_line.type } })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, paragraphPath] = selectionParent;

    const codeBlockLineItem =
      getAbove(editor, { at, match: { type: code_block_line.type } }) ||
      getParent(editor, paragraphPath);

    if (!codeBlockLineItem) return;
    const [codeBlockLineItemNode, codeBlockLineItemPath] = codeBlockLineItem;

    if (codeBlockLineItemNode.type !== code_block_line.type) return;

    const codeBlock = getParent(editor, codeBlockLineItemPath);
    if (!codeBlock) return;

    return {
      codeBlock,
      codeBlockLineItem,
    };
  }
};
