import { Hotkeys } from '@udecode/plate-common/react';
import {
  type KeyboardHandler,
  type TElement,
  getNodeEntries,
  getParentNode,
  isHotkey,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  select,
  withoutNormalizing,
} from '@udecode/plate-common';

import { getCodeLineType } from '../lib/options/getCodeLineType';
import { getCodeLineEntry } from '../lib/queries/getCodeLineEntry';
import { indentCodeLine } from '../lib/transforms/indentCodeLine';
import { outdentCodeLine } from '../lib/transforms/outdentCodeLine';

/**
 * - Shift+Tab: outdent code line.
 * - Tab: indent code line.
 */
export const onKeyDownCodeBlock: KeyboardHandler = ({ editor, event }) => {
  if (event.defaultPrevented) return;

  const isTab = Hotkeys.isTab(editor, event);
  const isUntab = Hotkeys.isUntab(editor, event);

  if (isTab || isUntab) {
    const _codeLines = getNodeEntries<TElement>(editor, {
      match: { type: getCodeLineType(editor) },
    });
    const codeLines = Array.from(_codeLines);

    if (codeLines.length > 0) {
      event.preventDefault();
      const [, firstLinePath] = codeLines[0];
      const codeBlock = getParentNode<TElement>(editor, firstLinePath);

      if (!codeBlock) return;

      withoutNormalizing(editor, () => {
        for (const codeLine of codeLines) {
          if (isUntab) {
            outdentCodeLine(editor, { codeBlock, codeLine });
          }
          // indent with tab
          if (isTab) {
            indentCodeLine(editor, { codeBlock, codeLine });
          }
        }
      });
    }
  }
  if (isHotkey('mod+a', event)) {
    const res = getCodeLineEntry(editor, {});

    if (!res) return;

    const { codeBlock } = res;
    const [, codeBlockPath] = codeBlock;

    if (isSelectionAtBlockEnd(editor) && isSelectionAtBlockStart(editor))
      return;

    // select the whole code block
    select(editor, codeBlockPath);

    event.preventDefault();
    event.stopPropagation();
  }

  // Note: rather than handling mod+enter/mod+shift+enter here, we recommend
  // using the exit-break plugin/ If not using exit-break, follow similar logic
  // to exit-break to add behavior to exit the code-block
};
