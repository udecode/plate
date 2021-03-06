import { Editor, Location } from 'slate';
import { getAbove } from '../../../common/queries/getAbove';
import { getParent } from '../../../common/queries/getParent';
import { someNode } from '../../../common/queries/someNode';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeLineOptions } from '../types';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeLineEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options?: CodeLineOptions
) => {
  const { code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  if (at && someNode(editor, { at, match: { type: code_line.type } })) {
    const selectionParent = getParent(editor, at);
    if (!selectionParent) return;
    const [, parentPath] = selectionParent;

    const codeLine =
      getAbove(editor, { at, match: { type: code_line.type } }) ||
      getParent(editor, parentPath);

    if (!codeLine) return;
    const [codeLineNode, codeLinePath] = codeLine;

    if (codeLineNode.type !== code_line.type) return;

    const codeBlock = getParent(editor, codeLinePath);
    if (!codeBlock) return;

    return {
      codeBlock,
      codeLine,
    };
  }
};
