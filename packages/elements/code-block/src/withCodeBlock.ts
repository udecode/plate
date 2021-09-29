import { SPEditor, WithOverride } from '@udecode/plate-core';
import { ReactEditor } from 'slate-react';
import { getCodeBlockInsertFragment } from './getCodeBlockInsertFragment';
import { getCodeLineEntry, getIndentDepth } from './queries';
import { insertCodeLine } from './transforms';

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

  editor.insertFragment = getCodeBlockInsertFragment(editor);

  return editor;
};
