import { getParent, KeyboardHandler } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { getCodeLineEntry } from './queries/getCodeLineEntry';
import { getCodeLines } from './queries/getCodeLines';
import { indentCodeLine } from './transforms/indentCodeLine';
import { outdentCodeLine } from './transforms/outdentCodeLine';
import { CodeBlockPlugin } from './types';

/**
 * - Shift+Tab: outdent code line.
 * - Tab: indent code line.
 */
export const onKeyDownCodeBlock: KeyboardHandler<{}, CodeBlockPlugin> = (
  editor
) => (e) => {
  if (e.key === 'Tab') {
    const shiftTab = e.shiftKey;
    const res = getCodeLineEntry(editor, {});
    if (res) {
      const { codeBlock, codeLine } = res;

      e.preventDefault();

      // outdent with shift+tab

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
    const codeLines = getCodeLines(editor, {});
    if (codeLines && codeLines?.[0]) {
      e.preventDefault();
      const [, firstLinePath] = codeLines[0];
      const codeBlock = getParent(editor, firstLinePath)!;
      for (const codeLine of codeLines) {
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
      }
    }
  }

  // FIXME: would prefer this as mod+a, but doesn't work
  if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
    const res = getCodeLineEntry(editor, {});
    if (!res) return;

    const { codeBlock } = res;
    const [, codeBlockPath] = codeBlock;

    // select the whole code block
    Transforms.select(editor, codeBlockPath);

    e.preventDefault();
    e.stopPropagation();
  }

  // Note: rather than handling mod+enter/mod+shift+enter here, we recommend
  // using the exit-break plugin/ If not using exit-break, follow similar logic
  // to exit-break to add behavior to exit the code-block
};
