import {
  getBlockAbove,
  getEndPoint,
  getPluginType,
  getPointBefore,
  getStartPoint,
  isRangeAcrossBlocks,
  isRangeInSameBlock,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { Range } from 'slate';
import { moveSelectionFromCell } from './transforms/index';
import { getCellTypes } from './utils/index';
import { keyShiftEdges } from './constants';
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
    if (op.type === 'set_selection' && op.newProperties) {
      const selection = {
        ...editor.selection,
        ...op.newProperties,
      } as Range | null;

      if (
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

      if (
        editor.lastKeyDown &&
        [
          'up',
          'down',
          'shift+up',
          'shift+right',
          'shift+down',
          'shift+left',
        ].includes(editor.lastKeyDown)
      ) {
        console.log('a');

        if (
          editor.selection?.focus &&
          selection?.focus &&
          isRangeAcrossBlocks(editor, {
            at: {
              anchor: editor.selection.focus,
              focus: selection.focus,
            },
            match: { type: getCellTypes(editor) },
          })
        ) {
          let edge: any;

          // if the previous selection was in a single cell
          if (
            isRangeInSameBlock(editor, {
              at: editor.selection,
              match: { type: getCellTypes(editor) },
            })
          ) {
            edge = keyShiftEdges[editor.lastKeyDown];
            console.log('yes');
          }

          console.log(op.properties);
          const prevSelection = editor.selection;
          const reverse = ['up', 'shift+up'].includes(editor.lastKeyDown);

          // selection.focus = editor.selection.focus;
          setTimeout(() => {
            console.log(edge, reverse, prevSelection, selection);

            moveSelectionFromCell(editor, {
              at: prevSelection,
              reverse,
              edge,
              force: true,
            });
          }, 0);
        }

        editor.lastKeyDown = null;
      }
    }

    apply(op);
  };

  return editor;
};
