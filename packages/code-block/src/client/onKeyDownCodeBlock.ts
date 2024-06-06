import { Hotkeys } from '@udecode/plate-common';
import {
  type KeyboardHandlerReturnType,
  type PlateEditor,
  type TElement,
  type Value,
  getNodeEntries,
  getParentNode,
  isHotkey,
  isSelectionAtBlockEnd,
  isSelectionAtBlockStart,
  select,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import { getCodeLineType } from '../shared/options/getCodeLineType';
import { getCodeLineEntry } from '../shared/queries/getCodeLineEntry';
import { indentCodeLine } from '../shared/transforms/indentCodeLine';
import { outdentCodeLine } from '../shared/transforms/outdentCodeLine';

/**
 * - Shift+Tab: outdent code line.
 * - Tab: indent code line.
 */
export const onKeyDownCodeBlock =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E
  ): KeyboardHandlerReturnType =>
  (e) => {
    if (e.defaultPrevented) return;

    const isTab = Hotkeys.isTab(editor, e);
    const isUntab = Hotkeys.isUntab(editor, e);

    if (isTab || isUntab) {
      const _codeLines = getNodeEntries<TElement>(editor, {
        match: { type: getCodeLineType(editor) },
      });
      const codeLines = Array.from(_codeLines);

      if (codeLines.length > 0) {
        e.preventDefault();
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
    if (isHotkey('mod+a', e)) {
      const res = getCodeLineEntry(editor, {});

      if (!res) return;

      const { codeBlock } = res;
      const [, codeBlockPath] = codeBlock;

      if (isSelectionAtBlockEnd(editor) && isSelectionAtBlockStart(editor))
        return;

      // select the whole code block
      select(editor, codeBlockPath);

      e.preventDefault();
      e.stopPropagation();
    }

    // Note: rather than handling mod+enter/mod+shift+enter here, we recommend
    // using the exit-break plugin/ If not using exit-break, follow similar logic
    // to exit-break to add behavior to exit the code-block
  };
