import type { ExtendPlateEditorExtension } from '@platejs/core/react';
import { PathApi } from '@platejs/plite';
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
  elements: [
    {
      match: (element) =>
        typeof element.id === 'string' && isInClosedToggle(editor, element.id),
      selectable: false,
      type: 'toggle-hidden-descendant',
    },
  ],
  transforms: {
    deleteBackward({ next, tx, unit }) {
      if (moveCurrentBlockAfterPreviousSelectable(editor, tx) === false) {
        return true;
      }

      return next({ unit });
    },
    deleteForward({ next, tx, unit }) {
      if (moveNextSelectableAfterCurrentBlock(editor, tx) === false) {
        return true;
      }

      return next({ unit });
    },
    insertBreak({ next, tx }) {
      const currentBlockEntry = tx.nodes.block();

      if (
        !currentBlockEntry ||
        currentBlockEntry[0].type !== KEYS.toggle ||
        typeof currentBlockEntry[0].id !== 'string'
      ) {
        return next();
      }

      const toggleId = currentBlockEntry[0].id;
      const isOpen = getOption('isOpen', toggleId);
      const lastEntryEnclosedInToggle = isOpen
        ? undefined
        : getLastEntryEnclosedInToggle(editor, toggleId);

      tx.withoutNormalizing(({ tx }) => {
        next();

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

          return;
        }

        const insertedBlock = tx.nodes.block();

        if (lastEntryEnclosedInToggle && insertedBlock) {
          tx.nodes.move({
            at: insertedBlock[1],
            to: PathApi.next(lastEntryEnclosedInToggle[1]),
          });
        }
      });

      return true;
    },
  },
});
