import type { ExtendEditor } from '@udecode/plate-common/react';

import {
  type SlateEditor,
  getBlockAbove,
  isNode,
  moveNodes,
} from '@udecode/plate-common';
import { type TIndentElement, indent } from '@udecode/plate-indent';

import type { ToggleConfig } from './TogglePlugin';

import { TogglePlugin } from '../lib/TogglePlugin';
import { getLastEntryEnclosedInToggle, isInClosedToggle } from './queries';
import {
  moveCurrentBlockAfterPreviousSelectable,
  moveNextSelectableAfterCurrentBlock,
} from './transforms';

// TODO react
export const withToggle: ExtendEditor<ToggleConfig> = ({
  editor,
  getOption,
}) => {
  const { deleteBackward, deleteForward, insertBreak, isSelectable } = editor;

  editor.isSelectable = (element) => {
    if (isNode(element) && isInClosedToggle(editor, element.id as string))
      return false;

    return isSelectable(element);
  };

  editor.deleteBackward = (unit) => {
    if (
      moveCurrentBlockAfterPreviousSelectable(editor as SlateEditor) === false
    )
      return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (moveNextSelectableAfterCurrentBlock(editor as SlateEditor) === false)
      return;

    deleteForward(unit);
  };

  editor.insertBreak = () => {
    // If we are inserting a break in a toggle:
    //   If the toggle is open
    //     - Add a new paragraph right after the toggle
    //     - Focus on that paragraph
    //   If the the toggle is closed:
    //     - Add a new paragraph after the last sibling enclosed in the toggle
    //     - Focus on that paragraph
    // Note: We are relying on the default behaviour of `insertBreak` which inserts a toggle right after the current toggle with the same indent
    const currentBlockEntry = getBlockAbove<TIndentElement>(editor);

    if (!currentBlockEntry || currentBlockEntry[0].type !== TogglePlugin.key) {
      return insertBreak();
    }

    const toggleId = currentBlockEntry[0].id as string;
    const isOpen = getOption('isOpen', toggleId);

    editor.withoutNormalizing(() => {
      if (isOpen) {
        insertBreak();
        editor.tf.toggle.block({ type: TogglePlugin.key });
        indent(editor);
      } else {
        const lastEntryEnclosedInToggle = getLastEntryEnclosedInToggle(
          editor,
          toggleId
        );

        insertBreak();

        if (lastEntryEnclosedInToggle) {
          const newlyInsertedTogglePath = [currentBlockEntry[1][0] + 1];
          const afterLastEntryEncloseInToggle = [
            lastEntryEnclosedInToggle[1][0] + 1,
          ];
          moveNodes(editor, {
            at: newlyInsertedTogglePath,
            to: afterLastEntryEncloseInToggle,
          });
        }
      }
    });
  };

  return editor;
};
