import type { KeyboardHandler } from '@udecode/plate/react';

import { Hotkeys, isHotkey } from '@udecode/plate';

/**
 * Handles keyboard events in code blocks.
 *
 * - Tab: insert tab character
 * - Shift+Tab: remove tab character
 * - Mod+A: select entire code block
 */
export const onKeyDownCodeBlock: KeyboardHandler = ({
  editor,
  event,
  type,
}) => {
  if (event.defaultPrevented) return;

  const isTab = Hotkeys.isTab(editor, event);
  const isUntab = Hotkeys.isUntab(editor, event);

  if (isTab) {
    // Insert tab character
    event.preventDefault();
    editor.tf.insertText('\t');
  } else if (isUntab) {
    // Remove tab character if at beginning of line
    event.preventDefault();
    const { selection } = editor;
    if (!selection) return;

    const startOfLine = editor.api.before(selection, { unit: 'line' });
    if (!startOfLine) return;

    const textBefore = editor.api.string({
      anchor: startOfLine,
      focus: selection.anchor,
    });

    if (textBefore.startsWith('\t')) {
      editor.tf.delete({
        at: {
          anchor: startOfLine,
          focus: {
            offset: startOfLine.offset + 1,
            path: startOfLine.path,
          },
        },
        unit: 'character',
      });
    }
  }

  if (isHotkey('mod+a', event)) {
    const { selection } = editor;
    if (!selection) return;

    // Find the code block containing the selection
    const [match] = editor.api.nodes({
      at: selection,
      match: { type },
    });

    if (!match) return;
    const [, path] = match;

    // Select the whole code block
    editor.tf.select(path);

    event.preventDefault();
    event.stopPropagation();
  }

  // Note: rather than handling mod+enter/mod+shift+enter here, we recommend
  // using the exit-break plugin/ If not using exit-break, follow similar logic
  // to exit-break to add behavior to exit the code-block
};
