import { Editor } from 'slate';
import { getCodeBlockLineEntry } from './queries/getCodeBlockLineEntry';
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
    const res = getCodeBlockLineEntry(editor, {}, options);
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

  // TODO: move this to withCodeBlock.insertFragment
  if (e.key === 'Enter') {
    const res = getCodeBlockLineEntry(editor, {}, options);
    if (!res) return;

    e.preventDefault();

    const { codeBlock, codeLine } = res;
    const indentDepth = getIndentDepth(editor, {
      codeBlock,
      codeLine,
    });

    // fixme pass the depth as part of the options object or a separate field?
    insertCodeLine(editor, indentDepth, options);
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
