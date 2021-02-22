import { Editor, Transforms } from 'slate';
import { getParent } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { CodeBlockOptions, CodeLineOptions } from '../types';

export const insertCodeBlock = (
  editor: Editor,
  {
    typeCodeBlock,
    ...options
  }: {
    typeCodeBlock: string;
  } & CodeBlockOptions &
    CodeLineOptions
) => {
  if (!editor.selection) return;

  const { code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  const selectionParentEntry = getParent(editor, editor.selection);
  if (!selectionParentEntry) return false;
  const [, selectionParentPath] = selectionParentEntry;

  Transforms.insertNodes(
    editor,
    {
      type: typeCodeBlock,
      children: [{ type: code_line.type, children: [{ text: '' }] }],
    },
    // FIXME: Should be after not before the selectionParentPath
    { at: selectionParentPath }
  );
  // FIXME: Move cursor/selection into the code-block element
  // Transforms.select(editor);
};
