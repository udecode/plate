import type { ExtendPlateEditorExtension } from '@platejs/core/react';
import { editorCommands, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ToggleConfig } from './TogglePlugin';

import { getLastEntryEnclosedInToggle, isInClosedToggle } from './queries';
import {
  moveCurrentBlockAfterPreviousSelectable,
  moveNextSelectableAfterCurrentBlock,
} from './transforms';

export const withToggle: ExtendPlateEditorExtension<ToggleConfig> = ({
  editor,
  getOption,
}) => ({
  commands: ({ around }) => [
    around(editorCommands.insertBreak, ({ state, next }) => {
      const currentBlockEntry = state.nodes.block();

      if (
        !currentBlockEntry ||
        currentBlockEntry[0].type !== KEYS.toggle ||
        typeof currentBlockEntry[0].id !== 'string'
      ) {
        return false;
      }

      const toggleId = currentBlockEntry[0].id;
      const isOpen = getOption('isOpen', toggleId);
      const lastEntryEnclosedInToggle = isOpen
        ? undefined
        : getLastEntryEnclosedInToggle(editor, toggleId);
      const result = next();

      if (result === false) return false;

      return state.transaction.extend(result, (tx) => {
        if (isOpen) {
          tx.blocks.toggle(KEYS.toggle);

          const insertedBlock = tx.nodes.block();

          if (insertedBlock) {
            const indent = insertedBlock[0][KEYS.indent];

            tx.nodes.set(
              { [KEYS.indent]: typeof indent === 'number' ? indent + 1 : 1 },
              { at: insertedBlock[1] }
            );
          }
        } else {
          const insertedBlock = tx.nodes.block();

          if (lastEntryEnclosedInToggle && insertedBlock) {
            tx.nodes.move({
              at: insertedBlock[1],
              to: PathApi.next(lastEntryEnclosedInToggle[1]),
            });
          }
        }
      });
    }),
    around(editorCommands.delete, ({ input, state, next }) => {
      let suppressDelete = false;
      const prefix = state.transaction((tx) => {
        suppressDelete =
          (input.direction === 'backward'
            ? moveCurrentBlockAfterPreviousSelectable(editor, tx)
            : moveNextSelectableAfterCurrentBlock(editor, tx)) === false;
      });

      return suppressDelete ? prefix : next.after(prefix);
    }),
  ],
  queries: {
    nodes: {
      isSelectable({ element, next }) {
        return typeof element.id === 'string' &&
          isInClosedToggle(editor, element.id)
          ? false
          : next();
      },
    },
  },
});
