import { SPEditor, WithOverride } from '@udecode/slate-plugins-core';
import { ReactEditor } from 'slate-react';
import { getCodeLineEntry } from './queries/getCodeLineEntry';
import { getIndentDepth } from './queries/getIndentDepth';
import { insertCodeLine } from './transforms/insertCodeLine';

export const withCodeBlock = (): WithOverride<ReactEditor & SPEditor> => (
  editor
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

  return editor;
};
