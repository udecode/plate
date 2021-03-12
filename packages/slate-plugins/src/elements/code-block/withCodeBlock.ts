import { ReactEditor } from 'slate-react';
import { getCodeLineEntry } from './queries/getCodeLineEntry';
import { getIndentDepth } from './queries/getIndentDepth';
import { insertCodeLine } from './transforms/insertCodeLine';
import { WithCodeBlockOptions, WithCodeLineOptions } from './types';

export const withCodeBlock = (
  options: WithCodeBlockOptions & WithCodeLineOptions = {}
) => <T extends ReactEditor>(editor: T) => {
  const { insertBreak } = editor;
  const insertBreakCodeBlock = () => {
    if (editor.selection) return;
    const res = getCodeLineEntry(editor, {}, options);
    if (!res) return;
    const { codeBlock, codeLine } = res;
    const indentDepth = getIndentDepth(editor, {
      codeBlock,
      codeLine,
    });
    insertCodeLine(editor, indentDepth, options);
    return true;
  };
  editor.insertBreak = () => {
    if (insertBreakCodeBlock()) return;
    insertBreak();
  };

  return editor;
};
