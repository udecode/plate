import { Editor, Transforms } from 'slate';
import { getParent } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockOptions, CodeLineOptions } from '../types';

export const insertCodeBlock = (
  editor: Editor,
  options: CodeBlockOptions & CodeLineOptions
) => {
  if (!editor.selection) return;

  const { code_line, code_block } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  const selectionParentEntry = getParent(editor, editor.selection);
  if (!selectionParentEntry) return false;
  const [, selectionParentPath] = selectionParentEntry;

  Transforms.insertNodes(
    editor,
    {
      type: code_block.type,
      children: [{ type: code_line.type, children: [{ text: '' }] }],
    },
    { at: selectionParentPath, select: true }
  );
};
