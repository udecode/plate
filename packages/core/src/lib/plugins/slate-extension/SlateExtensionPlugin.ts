import type { Descendant, TRange, Value } from '@udecode/slate';

import { type OmitFirst, bindFirst } from '@udecode/utils';

import { type PluginConfig, createTSlatePlugin } from '../../plugin';
import { resetEditor, toggleBlock } from '../../transforms';
import { BaseParagraphPlugin } from '../paragraph';

export type SlateExtensionConfig = PluginConfig<
  'slateExtension',
  {},
  {
    create: {
      value: () => Value;
    };
    reset: () => void;
  },
  {
    /**
     * Toggle the type of the selected block. If the block is not of the
     * specified type, it will be changed to that type. Otherwise, it will be
     * changed to the default type.
     */
    toggleBlock: OmitFirst<typeof toggleBlock>;
  }
>;

/** Opinionated extension of slate default behavior. */
export const SlateExtensionPlugin = createTSlatePlugin<SlateExtensionConfig>({
  key: 'slateExtension',
})
  .extendEditorTransforms(
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
        reset: () => {
          resetEditor(editor);
        },
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
        toggleBlock: bindFirst(toggleBlock, editor),
      };
    }
  )
  .extendEditorApi(({ editor }) => ({
    create: {
      block: (node) => ({
        children: [{ text: '' }],
        type: editor.getType(BaseParagraphPlugin),
        ...node,
      }),
    },
  }))
  .extendEditorApi(({ api }) => ({
    create: {
      /** Editor children factory. */
      value: (): Value => [api.create.block()],
    },
  }));
