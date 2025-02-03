import { type TText, PathApi, TextApi } from '@udecode/plate';
import { toPlatePlugin } from '@udecode/plate/react';

import { BaseTagPlugin } from '../lib';

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
        onChange(op) {
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
                editor.api.nodes<TText>({
                  text: true,
                })
              ).map(([text]) => text)
            );

            // Remove text not in selection
            editor.tf.removeNodes({
              at: [],
              empty: false,
              text: true,
              match: (text: TText) => !texts.has(text),
            });
          }
        },
      },
      transforms: {
        deleteBackward(unit) {
          deleteBackward(unit);

          if (
            editor.api.some({
              match: (n) => n.type === type,
            })
          ) {
            editor.tf.move();
          }
        },

        normalizeNode([node, path]) {
          // Duplicate tag removal
          if (
            node.type === type &&
            editor.api.some({
              at: [],
              match: (n, p) =>
                n.type === type &&
                n.value === node.value &&
                !PathApi.equals(p, path),
            })
          ) {
            editor.tf.removeNodes({
              at: path,
            });

            return;
          }
          // Trim leading whitespace
          if (TextApi.isText(node) && node.text) {
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
