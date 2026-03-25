import { toPlatePlugin } from 'platejs/react';

import { BaseTagPlugin } from '../lib';

type TextLike = {
  text: string;
};

const isPathEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const isTextNode = (value: any): value is TextLike =>
  typeof value?.text === 'string';

export const TagPlugin = toPlatePlugin(BaseTagPlugin);

export const MultiSelectPlugin = toPlatePlugin(
  BaseTagPlugin.overrideEditor(
    ({
      api: { onChange },
      editor,
      tf: { deleteBackward, normalizeNode },
      type,
    }) => ({
      api: {
        onChange(op: any) {
          onChange(op);

          const someTag = editor.api.some({
            match: { type },
          });

          if (someTag || !editor.selection) {
            // Remove non-empty texts when selecting a tag or when no selection
            editor.tf.removeNodes({
              at: [],
              empty: false,
              text: true,
            });
          } else {
            const texts = new Set(
              Array.from(
                editor.api.nodes<TextLike>({
                  text: true,
                })
              ).map((entry: any) => entry[0])
            );

            // Remove text not in selection
            editor.tf.removeNodes({
              at: [],
              empty: false,
              text: true,
              match: (text: TextLike) => !texts.has(text),
            });
          }
        },
      },
      transforms: {
        deleteBackward(unit: any) {
          deleteBackward(unit);

          if (
            editor.api.some({
              match: (n: any) => n.type === type,
            })
          ) {
            editor.tf.move();
          }
        },

        normalizeNode([node, path]: [any, number[]]) {
          // Duplicate tag removal
          if (
            node.type === type &&
            editor.api.some({
              at: [],
              match: (n: any, p: number[]) =>
                n.type === type &&
                n.value === node.value &&
                !isPathEqual(p, path),
            })
          ) {
            editor.tf.removeNodes({
              at: path,
            });

            return;
          }
          // Trim leading whitespace
          if (isTextNode(node) && node.text) {
            const trimmedText = node.text.trimStart();

            if (trimmedText !== node.text) {
              editor.tf.replaceNodes(
                { text: trimmedText },
                {
                  at: path,
                  select: true,
                }
              );

              return;
            }
          }

          normalizeNode([node, path]);
        },
      },
    })
  )
);
