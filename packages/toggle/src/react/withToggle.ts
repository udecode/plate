import type { OverrideEditor } from '@udecode/plate/react';

import { type SlateEditor, NodeApi } from '@udecode/plate';
import { type TIndentElement, indent } from '@udecode/plate-indent';

import type { ToggleConfig } from './TogglePlugin';

import { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { getLastEntryEnclosedInToggle, isInClosedToggle } from './queries';
import {
  moveCurrentBlockAfterPreviousSelectable,
  moveNextSelectableAfterCurrentBlock,
} from './transforms';

export const withToggle: OverrideEditor<ToggleConfig> = ({
  api: { isSelectable },
  editor,
  getOption,
  tf: { deleteBackward, deleteForward, insertBreak },
}) => ({
  api: {
    isSelectable(element) {
      if (
        NodeApi.isNode(element) &&
        isInClosedToggle(editor, element.id as string)
      )
        return false;

      return isSelectable(element);
    },
  },
  transforms: {
    deleteBackward(unit) {
      if (
        moveCurrentBlockAfterPreviousSelectable(editor as SlateEditor) === false
      )
        return;

      deleteBackward(unit);
    },

    deleteForward(unit) {
      if (moveNextSelectableAfterCurrentBlock(editor as SlateEditor) === false)
        return;

      deleteForward(unit);
    },

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
  },
});
