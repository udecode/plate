import { Editor } from 'slate';
import { getCodeBlockLineItemEntry } from './queries/getCodeBlockLineItem';
import { indentCodeBlockLine } from './transforms/indentCodeBlockLine';
import { outdentCodeBlockLine } from './transforms/outdentCodeBlockLine';
import { CodeBlockOnKeyDownOptions } from './types';

export const onKeyDownCodeBlock = (options?: CodeBlockOnKeyDownOptions) => (
  e: KeyboardEvent,
  editor: Editor
) => {
  let moved: boolean | undefined = false;

  if (e.key === 'Tab') {
    const res = getCodeBlockLineItemEntry(editor, {}, options);
    if (!res) return;
    const { codeBlock, codeBlockLineItem } = res;

    e.preventDefault();

    // outdent with shift+tab
    const shiftTab = e.shiftKey;
    if (shiftTab) {
      moved = outdentCodeBlockLine(
        editor,
        { codeBlock, codeBlockLineItem },
        options
      );
      if (moved) e.preventDefault();
    }

    // indent with tab
    const tab = !e.shiftKey;
    if (tab) {
      indentCodeBlockLine(editor, { codeBlock, codeBlockLineItem }, options);
    }
  }
};
