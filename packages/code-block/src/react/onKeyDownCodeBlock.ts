import type { KeyboardHandler } from '@udecode/plate/react';

import { type TElement, Hotkeys, isHotkey } from '@udecode/plate';

import { BaseCodeLinePlugin } from '../lib';
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
    const _codeLines = editor.api.nodes<TElement>({
      match: { type: editor.getType(BaseCodeLinePlugin) },
    });
    const codeLines = Array.from(_codeLines);

    if (codeLines.length > 0) {
      event.preventDefault();
      const [, firstLinePath] = codeLines[0];
      const codeBlock = editor.api.parent<TElement>(firstLinePath);

      if (!codeBlock) return;

      editor.tf.withoutNormalizing(() => {
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

    if (editor.api.isAt({ end: true }) && editor.api.isAt({ start: true }))
      return;

    // select the whole code block
    editor.tf.select(codeBlockPath);

    event.preventDefault();
    event.stopPropagation();
  }

  // Note: rather than handling mod+enter/mod+shift+enter here, we recommend
  // using the exit-break plugin/ If not using exit-break, follow similar logic
  // to exit-break to add behavior to exit the code-block
};
