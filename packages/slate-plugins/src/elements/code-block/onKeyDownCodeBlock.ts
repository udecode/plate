import { Editor } from 'slate';
import { getCodeLineEntry } from './queries/getCodeLineEntry';
import { getIndentDepth } from './queries/getIndentDepth';
import { indentCodeLine } from './transforms/indentCodeLine';
import { insertCodeLine } from './transforms/insertCodeLine';
import { outdentCodeLine } from './transforms/outdentCodeLine';
import { CodeBlockOnKeyDownOptions, CodeLineOnKeyDownOptions } from './types';

/**
 * - Shift+Tab: outdent code line.
 * - Tab: indent code line.
 */
export const onKeyDownCodeBlock = (
  options?: CodeBlockOnKeyDownOptions & CodeLineOnKeyDownOptions
) => (e: KeyboardEvent, editor: Editor) => {
  if (e.key === 'Tab') {
    const res = getCodeLineEntry(editor, {}, options);
    if (!res) return;
    const { codeBlock, codeLine } = res;

    e.preventDefault();

    // outdent with shift+tab
    const shiftTab = e.shiftKey;
    if (shiftTab) {
      // TODO: outdent multiple lines
      outdentCodeLine(editor, { codeBlock, codeLine });
    }

    // indent with tab
    const tab = !e.shiftKey;
    if (tab) {
      // TODO: indent multiple lines
      indentCodeLine(editor, { codeBlock, codeLine });
    }
    return;
  }

  if (e.key === 'mod+a') {
    // select all text
    return;
  }

  if (e.key === 'mod+enter') {
    // exit code block, move cursor to block after current code-block
  }
};
