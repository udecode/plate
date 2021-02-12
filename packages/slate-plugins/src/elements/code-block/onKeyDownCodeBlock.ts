import { Editor } from 'slate';
import { getCodeBlockLineItemEntry } from './queries/getCodeBlockLineItemEnrty';
import { indentCodeBlockLine } from './transforms/indentCodeBlockLine';
import { outdentCodeBlockLine } from './transforms/outdentCodeBlockLine';
import {
  CodeBlockLineOnKeyDownOptions,
  CodeBlockOnKeyDownOptions,
} from './types';

export const onKeyDownCodeBlock = (
  options?: CodeBlockOnKeyDownOptions & CodeBlockLineOnKeyDownOptions
) => (e: KeyboardEvent, editor: Editor) => {
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
      indentCodeBlockLine(editor, { codeBlock, codeBlockLineItem });
    }
  }
};
