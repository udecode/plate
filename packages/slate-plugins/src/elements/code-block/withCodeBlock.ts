import { ReactEditor } from 'slate-react';
import { setDefaults } from '../../common';
import { getCodeLineEntry } from './queries/getCodeLineEntry';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { getIndentDepth } from './queries';
import { insertCodeLine } from './transforms';
import { WithCodeBlockOptions, WithCodeLineOptions } from './types';

export const withCodeBlock = ({
  validCodeBlockChildrenTypes,
  ...options
}: WithCodeBlockOptions & WithCodeLineOptions = {}) => <T extends ReactEditor>(
  editor: T
) => {
  const { code_block, code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (!editor.selection) return;
    const res = getCodeLineEntry(editor, {}, options);
    if (!res) return;

    const { codeBlock, codeLine } = res;
    const indentDepth = getIndentDepth(editor, {
      codeBlock,
      codeLine,
    });

    insertCodeLine(editor, indentDepth, options);
  };
};
