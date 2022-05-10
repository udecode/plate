import {
  getNodeEntries,
  getParentNode,
  KeyboardHandler,
  select,
  TElement,
  withoutNormalizing,
} from '@udecode/plate-core';
import { getCodeLineType } from './options/getCodeLineType';
import { getCodeLineEntry } from './queries/getCodeLineEntry';
import { indentCodeLine } from './transforms/indentCodeLine';
import { outdentCodeLine } from './transforms/outdentCodeLine';
import { CodeBlockPlugin } from './types';

/**
 * - Shift+Tab: outdent code line.
 * - Tab: indent code line.
 */
export const onKeyDownCodeBlock: KeyboardHandler<CodeBlockPlugin> = (
  editor
) => (e) => {
  if (e.key === 'Tab') {
    const shiftTab = e.shiftKey;

    const _codeLines = getNodeEntries<TElement>(editor, {
      match: { type: getCodeLineType(editor) },
    });
    const codeLines = Array.from(_codeLines);

    if (codeLines.length) {
      e.preventDefault();
      const [, firstLinePath] = codeLines[0];
      const codeBlock = getParentNode<TElement>(editor, firstLinePath);
      if (!codeBlock) return;

      withoutNormalizing(editor, () => {
        for (const codeLine of codeLines) {
          if (shiftTab) {
            outdentCodeLine(editor, { codeBlock, codeLine });
          }

          // indent with tab
          if (!shiftTab) {
            indentCodeLine(editor, { codeBlock, codeLine });
          }
        }
      });
    }
  }

  // FIXME: would prefer this as mod+a, but doesn't work
  if (e.key === 'a' && (e.metaKey || e.ctrlKey)) {
    const res = getCodeLineEntry(editor, {});
    if (!res) return;

    const { codeBlock } = res;
    const [, codeBlockPath] = codeBlock;

    // select the whole code block
    select(editor, codeBlockPath);

    e.preventDefault();
    e.stopPropagation();
  }

  // Note: rather than handling mod+enter/mod+shift+enter here, we recommend
  // using the exit-break plugin/ If not using exit-break, follow similar logic
  // to exit-break to add behavior to exit the code-block
};
