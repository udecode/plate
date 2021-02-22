import { ReactEditor } from 'slate-react';
import { setDefaults } from '../../common';
import { getCodeLineEntry } from './queries/getCodeLineEntry';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { WithCodeBlockOptions } from './types';
 import { insertCodeLine } from './transforms';
import { getIndentDepth } from './queries';

export const withCodeBlock = ({
  validCodeBlockChildrenTypes,
  ...options
}): WithCodeBlockOptions = {}) => <T extends ReactEditor>(editor: T) => {
  const { code_block , code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    if (!editor.selection) return;

    const res = getCodeLineEntry(editor, {}, options);

      // TODO: move this to withCodeBlock.insertFragment

    if (!res) return;

    const { codeBlock, codeLine } = res;
    const indentDepth = getIndentDepth(editor, {
      codeBlock,
      codeLine,
    });

    // fixme pass the depth as part of the options object or a separate field?
    insertCodeLine(editor, indentDepth, options);
    return;
  }
  }
}

