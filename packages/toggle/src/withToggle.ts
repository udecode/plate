import {
  getBlockAbove,
  isNode,
  moveNodes,
  PlateEditor,
  toggleNodeType,
  Value,
} from '@udecode/plate-common';
import { indent, TIndentElement } from '@udecode/plate-indent';

import { getLastEntryEnclosedInToggle, isInClosedToggle } from './queries';
import { isToggleOpen } from './toggle-controller-store';
import { ELEMENT_TOGGLE } from './types';

export const withToggle = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { insertBreak, isSelectable } = editor;

  editor.isSelectable = (element) => {
    if (isNode(element) && isInClosedToggle<V, E>(editor, element.id as string))
      return false;
    return isSelectable(element);
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
    if (!currentBlockEntry || currentBlockEntry[0].type !== ELEMENT_TOGGLE) {
      return insertBreak();
    }

    const toggleId = currentBlockEntry[0].id as string;
    const isOpen = isToggleOpen<V, E>(editor, toggleId);

    editor.withoutNormalizing(() => {
      if (isOpen) {
        insertBreak();
        toggleNodeType(editor, { activeType: ELEMENT_TOGGLE });
        indent(editor);
      } else {
        const lastEntryEnclosedInToggle = getLastEntryEnclosedInToggle<V, E>(
          editor,
          toggleId
        );

        insertBreak();

        if (lastEntryEnclosedInToggle) {
          moveNodes(editor, {
            at: [currentBlockEntry[1][0] + 1], // Newly inserted toggle
            to: [lastEntryEnclosedInToggle[1][0] + 1], // Right after the last enclosed element
          });
        }
      }
    });
  };

  return editor;
};
