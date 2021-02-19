import { Editor } from 'slate';
import { getCodeBlockLineEntry } from './queries/getCodeBlockLineEntry';
import { getIndentDepth } from './queries/getIndentDepth';
import { indentCodeBlockLine } from './transforms/indentCodeBlockLine';
import { insertCodeBlockLine } from './transforms/insertCodeBlockLine';
import { outdentCodeBlockLine } from './transforms/outdentCodeBlockLine';
import {
  CodeBlockLineOnKeyDownOptions,
  CodeBlockOnKeyDownOptions,
} from './types';

export const onKeyDownCodeBlock = (
  options?: CodeBlockOnKeyDownOptions & CodeBlockLineOnKeyDownOptions
) => (e: KeyboardEvent, editor: Editor) => {
  if (e.key === 'Tab') {
    const res = getCodeBlockLineEntry(editor, {}, options);
    if (!res) return;
    const { codeBlock, codeBlockLineItem } = res;

    e.preventDefault();

    // outdent with shift+tab
    const shiftTab = e.shiftKey;
    if (shiftTab) {
      outdentCodeBlockLine(editor, { codeBlock, codeBlockLineItem });
    }

    // indent with tab
    const tab = !e.shiftKey;
    if (tab) {
      indentCodeBlockLine(editor, { codeBlock, codeBlockLineItem });
    }
    return;
  }

  if (e.key === 'Enter') {
    const res = getCodeBlockLineEntry(editor, {}, options);
    if (!res) return;
    e.preventDefault();
    const { codeBlock, codeBlockLineItem } = res;
    const indentDepth = getIndentDepth(editor, {
      codeBlock,
      codeBlockLineItem,
    });
    // fixme pass the depth as part of the options object or a separate field?
    insertCodeBlockLine(editor, options, indentDepth);
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
