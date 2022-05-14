import { PlateEditor, Value } from '@udecode/plate-core';
import { insertFragmentCodeBlock } from './insertFragmentCodeBlock';
import { getCodeLineEntry, getIndentDepth } from './queries';
import { insertCodeLine } from './transforms';

export const withCodeBlock = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { insertBreak } = editor;

  const insertBreakCodeBlock = () => {
    if (!editor.selection) return;

    const res = getCodeLineEntry(editor, {});
    if (!res) return;

    const { codeBlock, codeLine } = res;
    const indentDepth = getIndentDepth(editor, {
      codeBlock,
      codeLine,
    });
    insertCodeLine(editor, indentDepth);

    return true;
  };

  editor.insertBreak = () => {
    if (insertBreakCodeBlock()) return;

    insertBreak();
  };

  editor.insertFragment = insertFragmentCodeBlock(editor);

  return editor;
};
