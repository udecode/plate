import type { DefinitionOf } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';
import {
  editorCommands,
  editorReads,
  ElementApi,
  PathApi,
} from '@platejs/plite';

import { BaseTogglePlugin } from '../lib/BaseTogglePlugin';
import { ToggleVisibility } from './ToggleVisibility.internal';
import { useToggle } from './useToggle.internal';

/** Enables support for toggleable elements in the editor. */
export const TogglePlugin = toPlatePlugin(BaseTogglePlugin).extend(
  ({ schema, store }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertBreak, ({ state, next }) => {
        const currentBlockEntry = state.nodes.block();

        if (!currentBlockEntry || currentBlockEntry[0].type !== schema.type) {
          return false;
        }

        const toggleKey = state.key(currentBlockEntry[1])!;
        const isOpen = store.get('isOpen', toggleKey);
        const lastEnclosedEntry = isOpen
          ? undefined
          : state.toggle.lastEnclosedEntry(toggleKey);
        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, (tx) => {
          if (isOpen) {
            tx.blocks.toggle(schema.type);

            const insertedBlock = tx.nodes.block();

            if (insertedBlock) {
              const indent = insertedBlock[0].indent;

              tx.nodes.set(
                {
                  indent: typeof indent === 'number' ? indent + 1 : 1,
                },
                { at: insertedBlock[1] }
              );
            }
          } else {
            const insertedBlock = tx.nodes.block();

            if (lastEnclosedEntry && insertedBlock) {
              tx.nodes.move({
                at: insertedBlock[1],
                to: PathApi.next(lastEnclosedEntry[1]),
              });
            }
          }
        });
      }),
      around(editorCommands.delete, ({ input, state, next }) => {
        let suppressDelete = false;
        const prefix = state.transaction((tx) => {
          const currentBlock = tx.nodes.block();

          if (!currentBlock) return;

          if (input.direction === 'backward') {
            if (!tx.selection() || !tx.selection.isAtBlockStart()) return;

            const blockIndex = currentBlock[1].at(-1);

            if (blockIndex === undefined || blockIndex === 0) return;

            const blockBefore = tx.nodes.get(PathApi.previous(currentBlock[1]));

            if (
              !blockBefore ||
              !ElementApi.isElement(blockBefore[0]) ||
              !store.get('isClosed', state.key(blockBefore[1])!)
            ) {
              return;
            }

            const previousSelectableBlock = tx.nodes.previous({
              at: blockBefore[1],
              match: (node) =>
                ElementApi.isElement(node) &&
                !store.get('isClosed', state.key(node)),
            });

            if (!previousSelectableBlock) {
              suppressDelete = true;

              return;
            }

            tx.nodes.move({
              at: currentBlock[1],
              to: PathApi.next(previousSelectableBlock[1]),
            });

            return;
          }

          if (!tx.selection() || !tx.selection.isAtBlockEnd()) return;

          const blockAfter = tx.nodes.get(PathApi.next(currentBlock[1]));

          if (
            !blockAfter ||
            !ElementApi.isElement(blockAfter[0]) ||
            !store.get('isClosed', state.key(blockAfter[1])!)
          ) {
            return;
          }

          const nextSelectableBlock = tx.nodes.next({
            at: blockAfter[1],
            match: (node) =>
              ElementApi.isElement(node) &&
              !store.get('isClosed', state.key(node)),
          });

          if (!nextSelectableBlock) {
            suppressDelete = true;

            return;
          }

          tx.nodes.move({
            at: nextSelectableBlock[1],
            to: PathApi.next(currentBlock[1]),
          });
        });

        return suppressDelete ? prefix : next.after(prefix);
      }),
    ],
    readMiddleware: ({ around }) => [
      around(
        editorReads.nodes.isSelectable,
        ({ input: { element }, next, state }) =>
          ElementApi.isElement(element) &&
          store.get('isClosed', state.key(element))
            ? false
            : next()
      ),
    ],
    render: {
      aboveNodes: () => ToggleVisibility,
    },
    useHooks: useToggle,
  })
);

export type ToggleDefinition = DefinitionOf<typeof TogglePlugin>;
