import type { SlateEditor } from '@udecode/plate';
import type { ExtendEditorTransforms } from '@udecode/plate/react';

import { type TIndentElement, indent } from '@udecode/plate-indent';

import type { ToggleConfig } from './TogglePlugin';

import { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { getLastEntryEnclosedInToggle } from './queries';
import {
  moveCurrentBlockAfterPreviousSelectable,
  moveNextSelectableAfterCurrentBlock,
} from './transforms';

export const withToggle: ExtendEditorTransforms<ToggleConfig> = ({
  editor,
  getOption,
  tf: { deleteBackward, deleteForward, insertBreak },
}) => ({
  deleteBackward(options) {
    if (
      moveCurrentBlockAfterPreviousSelectable(editor as SlateEditor) === false
    )
      return;

    deleteBackward(options);
  },

  deleteForward(options) {
    if (moveNextSelectableAfterCurrentBlock(editor as SlateEditor) === false)
      return;

    deleteForward(options);
  },

  // If we are inserting a break in a toggle:
  //   If the toggle is open
  //     - Add a new paragraph right after the toggle
  //     - Focus on that paragraph
  //   If the the toggle is closed:
  //     - Add a new paragraph after the last sibling enclosed in the toggle
  //     - Focus on that paragraph
  // Note: We are relying on the default behaviour of `insertBreak` which inserts a toggle right
  // after the current toggle with the same indent
  insertBreak() {
    const currentBlockEntry = editor.api.block<TIndentElement>();

    if (
      !currentBlockEntry ||
      currentBlockEntry[0].type !== BaseTogglePlugin.key
    ) {
      return insertBreak();
    }

    const toggleId = currentBlockEntry[0].id as string;
    const isOpen = getOption('isOpen', toggleId);

    editor.tf.withoutNormalizing(() => {
      if (isOpen) {
        insertBreak();
        editor.tf.toggleBlock(BaseTogglePlugin.key);
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
          editor.tf.moveNodes({
            at: newlyInsertedTogglePath,
            to: afterLastEntryEncloseInToggle,
          });
        }
      }
    });
  },
});
