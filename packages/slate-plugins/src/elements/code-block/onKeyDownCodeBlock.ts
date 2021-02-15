import { Editor } from 'slate';
import { getCodeBlockLineItemEntry } from './queries/getCodeBlockLineItemEntry';
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
    const res = getCodeBlockLineItemEntry(editor, {}, options);
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
  }

  if (e.key === 'Enter') {
    const res = getCodeBlockLineItemEntry(editor, {}, options);
    if (!res) return;
    e.preventDefault();
    const { codeBlock, codeBlockLineItem } = res;
    const indentDepth = getIndentDepth(editor, {
      codeBlock,
      codeBlockLineItem,
    });
    // fixme pass the depth as part of the options object or a separate field?
    insertCodeBlockLine(editor, options, indentDepth);
  }
};
