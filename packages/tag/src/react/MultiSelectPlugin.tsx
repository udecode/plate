import { toPlatePlugin } from '@platejs/core/react';
import {
  editorCommands,
  ElementApi,
  PathApi,
  TextApi,
  type Text,
} from '@platejs/plite';
import type { TTagElement } from '@platejs/utils';

import { BaseTagPlugin } from '../lib';

export const MultiSelectPlugin = toPlatePlugin(
  BaseTagPlugin,
  ({ editor, type }) => ({
    commands: ({ around }) => [
      around(editorCommands.delete, ({ input, state, next }) => {
        if (input.direction !== 'backward') return false;

        const result = next();

        if (result === false) return false;

        return state.transaction.extend(result, (tx) => {
          if (tx.nodes.some({ match: { type } })) {
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
          const removeAllText =
            !selection || tx.nodes.some({ match: { type } });
          const selectedPaths = removeAllText
            ? null
            : new Set(
                Array.from(
                  tx.nodes.entries<Text>({
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
            ElementApi.isElementType<TTagElement>(node, type) &&
            tx.nodes.some<TTagElement>({
              at: [],
              match: (candidate, candidatePath) =>
                ElementApi.isElementType<TTagElement>(candidate, type) &&
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
                ? editor.anchor(selection, {
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

              const nextSelection = selectionAnchor?.release();

              if (nextSelection) tx.selection.setRange(nextSelection);
              return;
            }
          }
        },
      },
    ],
  })
);
