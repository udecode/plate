import { useEffect } from 'react';

import type { ExtendConfig } from '@platejs/core';
import { toPlatePlugin, useEditorSelector } from '@platejs/core/react';
import { editorCommands, ElementApi, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import {
  type BaseToggleConfig,
  BaseTogglePlugin,
} from '../lib/BaseTogglePlugin';
import { renderToggleAboveNodes } from './renderToggleAboveNodes';

export type ToggleConfig = ExtendConfig<
  BaseToggleConfig,
  {
    toggleIndex: Map<string, string[]>;
  },
  {},
  {},
  {
    enclosingIds: (
      state: Readonly<{
        openIds: Set<string>;
        toggleIndex: Map<string, string[]>;
      }>,
      elementId: string
    ) => string[];
    isClosed: (
      state: Readonly<{
        openIds: Set<string>;
        toggleIndex: Map<string, string[]>;
      }>,
      elementId: string
    ) => boolean;
  }
>;

/** Enables support for toggleable elements in the editor. */
export const TogglePlugin = toPlatePlugin<ToggleConfig, ToggleConfig>(
  BaseTogglePlugin,
  ({ store }) => ({
    initialState: {
      toggleIndex: new Map(),
    },
    render: {
      aboveNodes: renderToggleAboveNodes,
    },
    selectors: {
      enclosingIds: (state, elementId) =>
        state.toggleIndex.get(elementId) ?? [],
      isClosed: (state, elementId) => {
        const { openIds, toggleIndex } = state;

        return (toggleIndex.get(elementId) ?? []).some(
          (toggleId) => !openIds.has(toggleId)
        );
      },
    },
    useHooks: ({ store }) => {
      const toggleIndex = useEditorSelector(
        (editor) => {
          const result = new Map<string, string[]>();
          let enclosingToggles: [string, number][] = [];

          editor.read.children().forEach((element) => {
            if (!ElementApi.isElement(element)) return;

            const indentValue = element[KEYS.indent];
            const indent = typeof indentValue === 'number' ? indentValue : 0;
            const adjustedIndent =
              element.listStyleType && indent ? indent - 1 : indent;

            enclosingToggles = enclosingToggles.filter(
              ([, toggleIndent]) => toggleIndent < adjustedIndent
            );

            if (typeof element.id !== 'string') return;

            result.set(
              element.id,
              enclosingToggles.map(([toggleId]) => toggleId)
            );

            if (element.type === editor.getType(KEYS.toggle)) {
              enclosingToggles.push([element.id, adjustedIndent]);
            }
          });

          return result;
        },
        {
          equalityFn: (left, right) => {
            if (left === right) return true;
            if (!left || !right || left.size !== right.size) return false;

            return [...left].every(([id, toggleIds]) => {
              const previousToggleIds = right.get(id);

              return (
                previousToggleIds !== undefined &&
                previousToggleIds.length === toggleIds.length &&
                toggleIds.every(
                  (toggleId, index) => previousToggleIds[index] === toggleId
                )
              );
            });
          },
        }
      );

      useEffect(() => {
        store.set({ toggleIndex });
      }, [store, toggleIndex]);
    },
    extension: {
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
          const isOpen = store.get('isOpen', toggleId);
          const lastEnclosedEntry = isOpen
            ? undefined
            : state.toggle.lastEnclosedEntry(toggleId);
          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            if (isOpen) {
              tx.blocks.toggle(KEYS.toggle);

              const insertedBlock = tx.nodes.block();

              if (insertedBlock) {
                const indent = insertedBlock[0][KEYS.indent];

                tx.nodes.set(
                  {
                    [KEYS.indent]: typeof indent === 'number' ? indent + 1 : 1,
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

              const blockBefore = tx.nodes.get(
                PathApi.previous(currentBlock[1])
              );

              if (
                !blockBefore ||
                !ElementApi.isElement(blockBefore[0]) ||
                typeof blockBefore[0].id !== 'string' ||
                !store.get('isClosed', blockBefore[0].id)
              ) {
                return;
              }

              const previousSelectableBlock = tx.nodes.previous({
                at: blockBefore[1],
                match: (node) =>
                  ElementApi.isElement(node) &&
                  (typeof node.id !== 'string' ||
                    !store.get('isClosed', node.id)),
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
              typeof blockAfter[0].id !== 'string' ||
              !store.get('isClosed', blockAfter[0].id)
            ) {
              return;
            }

            const nextSelectableBlock = tx.nodes.next({
              at: blockAfter[1],
              match: (node) =>
                ElementApi.isElement(node) &&
                (typeof node.id !== 'string' ||
                  !store.get('isClosed', node.id)),
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
      queries: {
        nodes: {
          isSelectable({ element, next }) {
            return typeof element.id === 'string' &&
              store.get('isClosed', element.id)
              ? false
              : next();
          },
        },
      },
    },
  })
);
