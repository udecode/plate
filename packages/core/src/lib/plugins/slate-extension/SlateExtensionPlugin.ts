import type { Descendant, TRange, Value } from '@udecode/slate';

import { createSlatePlugin } from '../../plugin';
import { BaseParagraphPlugin } from '../paragraph';

/** Opinionated extension of slate default behavior. */
export const SlateExtensionPlugin = createSlatePlugin({
  key: 'slateExtension',
})
  .overrideEditor(
    ({
      editor,
      tf: { apply, deleteBackward, deleteForward, deleteFragment },
    }) => {
      const resetMarks = () => {
        if (editor.api.isAt({ start: true })) {
          editor.tf.removeMarks();
        }
      };

      return {
        api: {
          create: {
            block: (node) => ({
              children: [{ text: '' }],
              type: editor.getType(BaseParagraphPlugin),
              ...node,
            }),
          },
        },
        transforms: {
          apply(operation) {
            if (operation.type === 'set_selection') {
              const { properties } = operation;
              editor.prevSelection = properties as TRange | null;
              apply(operation);
              editor.currentKeyboardEvent = null;

              return;
            }

            apply(operation);
          },
          deleteBackward(unit) {
            deleteBackward(unit);
            resetMarks();
          },
          deleteForward(unit) {
            deleteForward(unit);
            resetMarks();
          },
          deleteFragment(options) {
            deleteFragment(options);
            resetMarks();
          },
        },
      };
    }
  )
  .extendEditorTransforms(({ editor }) => ({
    setValue: <V extends Value>(value?: V | string) => {
      let children: Descendant[] = value as any;

      if (typeof value === 'string') {
        children = editor.api.html.deserialize({
          element: value,
        });
      } else if (!value || value.length === 0) {
        children = editor.api.create.value();
      }

      editor.tf.replaceNodes(children, {
        at: [],
        children: true,
      });
    },
  }));
