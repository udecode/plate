import {
  getBlockAbove,
  getEndPoint,
  getPluginType,
  getPointBefore,
  getStartPoint,
  isRangeAcrossBlocks,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Range } from 'slate';
import { ELEMENT_TABLE } from './createTablePlugin';

// TODO: tests

/**
 * Selection table:
 * - If anchor is in table, focus in a block before: set focus to start of table
 * - If anchor is in table, focus in a block after: set focus to end of table
 * - If focus is in table, anchor in a block before: set focus to end of table
 * - If focus is in table, anchor in a block after: set focus to the point before start of table
 */
export const withSelectionTable = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E
) => {
  const { apply } = editor;

  editor.apply = (op) => {
    if (op.type === 'set_selection') {
      const selection = {
        ...editor.selection,
        ...op.newProperties,
      } as Range | null;

      if (
        op.newProperties &&
        Range.isRange(selection) &&
        isRangeAcrossBlocks(editor, {
          at: selection,
          match: (n) => n.type === getPluginType(editor, ELEMENT_TABLE),
        })
      ) {
        const anchorEntry = getBlockAbove(editor, {
          at: selection.anchor,
          match: (n) => n.type === getPluginType(editor, ELEMENT_TABLE),
        });

        if (!anchorEntry) {
          const focusEntry = getBlockAbove(editor, {
            at: selection.focus,
            match: (n) => n.type === getPluginType(editor, ELEMENT_TABLE),
          });

          if (focusEntry) {
            op.newProperties.focus = Range.isBackward(selection)
              ? getPointBefore(editor, getStartPoint(editor, focusEntry[1]))
              : getEndPoint(editor, focusEntry[1]);
          }
        } else {
          op.newProperties.focus = Range.isBackward(selection)
            ? getStartPoint(editor, anchorEntry[1])
            : getEndPoint(editor, anchorEntry[1]);
        }
      }
    }

    apply(op);
  };

  return editor;
};
