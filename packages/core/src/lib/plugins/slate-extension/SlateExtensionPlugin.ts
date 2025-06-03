import {
  type Descendant,
  type TRange,
  type Value,
  ElementApi,
} from '@udecode/slate';

import type { CreateSlateEditorOptions } from '../../editor';

import { pipeNormalizeInitialValue } from '../../../internal/plugin/pipeNormalizeInitialValue';
import { createSlatePlugin, getPluginTypes } from '../../plugin';
import { BaseParagraphPlugin } from '../paragraph';

export type InitOptions = Pick<
  CreateSlateEditorOptions,
  'autoSelect' | 'selection' | 'shouldNormalizeEditor' | 'value'
>;

/** Opinionated extension of slate default behavior. */
export const SlateExtensionPlugin = createSlatePlugin({
  key: 'slateExtension',
})
  .overrideEditor(
    ({
      editor,
      tf: { apply, deleteBackward, deleteForward, deleteFragment, insertBreak },
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
              type: editor.getType(BaseParagraphPlugin.key),
              ...node,
            }),
          },
        },
        transforms: {
          apply(operation) {
            if (operation.type === 'set_selection') {
              const { properties } = operation;
              editor.dom.prevSelection = properties as TRange | null;
              apply(operation);
              editor.dom.currentKeyboardEvent = null;

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
          insertBreak() {
            const lineBreakPlugins = getPluginTypes(
              editor,
              editor.meta.pluginKeys.node.breakMode.lineBreak
            );
            const splitOnEmptyLinePlugins = getPluginTypes(
              editor,
              editor.meta.pluginKeys.node.breakMode.splitOnEmptyLine
            );

            if (lineBreakPlugins.length > 0) {
              const block = editor.api.block({
                match: (node) =>
                  ElementApi.isElement(node) &&
                  lineBreakPlugins.includes(node.type),
              });

              if (block) {
                editor.tf.insertSoftBreak();
                return;
              }
            }

            if (splitOnEmptyLinePlugins.length > 0) {
              const block = editor.api.block({
                match: (node) =>
                  ElementApi.isElement(node) &&
                  splitOnEmptyLinePlugins.includes(node.type),
              });

              if (
                block &&
                editor.api.isCollapsed() &&
                !editor.api.isAt({ start: true })
              ) {
                const range = editor.api.range('before', editor.selection!);
                if (range) {
                  const char = editor.api.string(range);
                  if (char !== '\n') {
                    editor.tf.insertSoftBreak();
                    return;
                  }
                }
              }
            }

            insertBreak();
          },
        },
      };
    }
  )
  .extendEditorTransforms(({ editor }) => ({
    /**
     * Initialize the editor value, selection and normalization. Set `value` to
     * `null` to skip children initialization.
     */
    async init({
      autoSelect,
      selection,
      shouldNormalizeEditor,
      value,
    }: InitOptions) {
      if (value !== null) {
        if (typeof value === 'string') {
          editor.children = editor.api.html.deserialize({
            element: value,
          }) as Value;
        } else if (typeof value === 'function') {
          editor.children = await value(editor);
        } else if (value) {
          editor.children = value;
        }
        if (!editor.children || editor.children?.length === 0) {
          editor.children = editor.api.create.value();
        }
      }

      if (selection) {
        editor.selection = selection;
      } else if (autoSelect) {
        const edge = autoSelect === 'start' ? 'start' : 'end';
        const target =
          edge === 'start' ? editor.api.start([]) : editor.api.end([]);

        editor.tf.select(target!);
      }
      if (editor.children.length > 0) {
        pipeNormalizeInitialValue(editor);
      }
      if (shouldNormalizeEditor) {
        editor.tf.normalize({ force: true });
      }
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
  }));
