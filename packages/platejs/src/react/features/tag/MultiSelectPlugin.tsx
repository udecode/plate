import {
  editorCommands,
  ElementApi,
  type Node,
  PathApi,
  TextApi,
} from '../../../core';
import { BaseTagPlugin } from '../../../features/tag/lib';
import type { TagElement } from '../../../features/tag/lib/BaseTagPlugin';
import { toPlatePlugin } from '../../core';

const isTagElement = (node: Node, type: string): node is TagElement =>
  ElementApi.isElementType(node, type) && typeof node.value === 'string';

export const MultiSelectPlugin = toPlatePlugin(
  BaseTagPlugin,
  ({ editor, plugin, schema: { type } }) => ({
    commands: ({ around }) => [
      around(editorCommands.delete, ({ input, state, next }) => {
        if (input.direction !== 'backward') return false;

        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, (tx) => {
          if (tx.nodes.some({ type: plugin })) {
            tx.selection.move();
          }
        });
      }),
    ],
    on: {
      commit({ commit }) {
        if (commit.tags.includes('multi-select-cleanup')) return;

        editor.update({ tags: 'multi-select-cleanup' }, (tx) => {
          const selection = tx.selection();
          const removeAllText = !selection || tx.nodes.some({ type: plugin });
          const selectedPaths = removeAllText
            ? null
            : new Set(
                Array.from(
                  tx.nodes.entries({
                    at: selection,
                    match: TextApi.isText,
                  })
                ).map(([, path]) => path.join(','))
              );

          tx.nodes.remove({
            at: [],
            match: (node, path) =>
              TextApi.isText(node) &&
              node.text.length > 0 &&
              (removeAllText || !selectedPaths?.has(path.join(','))),
          });
        });
      },
    },
    corrections: [
      {
        event: 'content',
        correct({ entry: [node, path], tx }) {
          if (
            isTagElement(node, type) &&
            tx.nodes.some({
              at: [],
              type: plugin,
              match: (candidate, candidatePath) =>
                candidate.value === node.value &&
                !PathApi.equals(candidatePath, path),
            })
          ) {
            tx.nodes.remove({ at: path });
            return;
          }

          if (TextApi.isText(node)) {
            const leadingWhitespace =
              node.text.length - node.text.trimStart().length;

            if (leadingWhitespace > 0) {
              const selection = tx.selection();
              const selectionAnchor = selection
                ? tx.anchor(selection, {
                    association: 'inward',
                    deletion: 'nearest',
                  })
                : null;

              tx.text.delete({
                at: {
                  anchor: { offset: 0, path },
                  focus: { offset: leadingWhitespace, path },
                },
              });

              const nextSelection = selectionAnchor?.resolve();

              if (nextSelection) tx.selection.set(nextSelection);
            }
          }
        },
      },
    ],
  })
);
