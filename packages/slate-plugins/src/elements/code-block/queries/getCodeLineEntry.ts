import { getAbove, getParent, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Location } from 'slate';

/**
 * If at (default = selection) is in ul>li>p, return li and ul node entries.
 */
export const getCodeLineEntry = (
  editor: Editor,
  { at = editor.selection }: { at?: Location | null } = {},
  options: SlatePluginsOptions
) => {
  const { code_line } = options;

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
