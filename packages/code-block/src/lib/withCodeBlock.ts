import type { ExtendEditor } from '@udecode/plate-common';

import type { CodeBlockConfig } from './BaseCodeBlockPlugin';

import { insertFragmentCodeBlock } from './insertFragmentCodeBlock';
import { normalizeCodeBlock } from './normalizers/normalizeCodeBlock';
import { getCodeLineEntry, getIndentDepth } from './queries';
import { indentCodeLine } from './transforms';

export const withCodeBlock: ExtendEditor<CodeBlockConfig> = ({ editor }) => {
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
