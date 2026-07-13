import { toPlatePlugin } from '@platejs/core/react';
import { ElementApi, PathApi, TextApi, type Text } from '@platejs/plite';
import type { TTagElement } from '@platejs/utils';

import { BaseTagPlugin } from '../lib';

export const TagPlugin = toPlatePlugin(BaseTagPlugin);

export const MultiSelectPlugin = toPlatePlugin(BaseTagPlugin, {
  handlers: {
    onChange: ({ editor, type }) => {
      editor.update((tx) => {
        const selection = tx.selection();
        const removeAllText = !selection || tx.nodes.some({ match: { type } });
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
}).extendExtension(({ editor, type }) => ({
  normalizers: {
    node({ entry: [node, path], next, tx }) {
      if (
        ElementApi.isElementType<TTagElement>(node, type) &&
        editor.read.nodes.some<TTagElement>({
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
          tx.text.delete({
            at: {
              anchor: { offset: 0, path },
              focus: { offset: leadingWhitespace, path },
            },
          });
          return;
        }
      }

      next();
    },
  },
  transforms: {
    deleteBackward({ next, tx, unit }) {
      const result = next({ unit });

      if (tx.nodes.some({ match: { type } })) {
        tx.selection.move();
      }

      return result;
    },
  },
}));
