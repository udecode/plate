import { PlateEditor, Value } from '@udecode/plate-common';

import { insertFragmentCodeBlock } from './insertFragmentCodeBlock';
import { normalizeCodeBlock } from './normalizers/normalizeCodeBlock';
import { getCodeLineEntry, getIndentDepth } from './queries/index';
import { indentCodeLine } from './transforms/index';

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

    insertBreak();

    indentCodeLine(editor, {
      codeBlock,
      codeLine,
      indentDepth,
    });

    return true;
  };

  editor.insertBreak = () => {
    if (insertBreakCodeBlock()) return;

    insertBreak();
  };

  editor.insertFragment = insertFragmentCodeBlock(editor);

  editor.normalizeNode = normalizeCodeBlock(editor);

  return editor;
};
