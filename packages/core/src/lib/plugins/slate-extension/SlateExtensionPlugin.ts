import {
  type Descendant,
  type TRange,
  type TText,
  type Value,
  NodeApi,
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
      tf: { apply, deleteBackward, deleteForward, deleteFragment, insertText },
    }) => {
      const resetMarks = () => {
        if (editor.api.isAt({ start: true })) {
          editor.tf.removeMarks();
        }
      };

      const clearOnBoundaryMarks = getPluginTypes(
        editor,
        editor.meta.pluginKeys.node.clearOnBoundary
      );

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
          insertText(text, options) {
            const apply = () => {
              if (
                editor.meta.pluginKeys.node.clearOnBoundary.length === 0 ||
                !editor.selection ||
                editor.api.isExpanded()
              ) {
                return;
              }

              const textPath = editor.selection.focus.path;
              const textNode = NodeApi.get<TText>(editor, textPath);

              if (!textNode) {
                return;
              }

              const isMarked = clearOnBoundaryMarks.some(
                (key) => !!textNode[key]
              );

              if (
                !isMarked ||
                !editor.api.isEnd(editor.selection.focus, textPath)
              ) {
                return;
              }

              const nextPoint = editor.api.start(textPath, { next: true });
              const marksToRemove: string[] = [];

              // Get next text node once outside the loop
              let nextTextNode: TText | null = null;
              if (nextPoint) {
                const nextTextPath = nextPoint.path;
                nextTextNode = NodeApi.get<TText>(editor, nextTextPath) || null;
              }

              // Check each mark individually
              for (const markKey of clearOnBoundaryMarks) {
                if (!textNode[markKey]) {
                  continue; // Skip marks not present on current node
                }

                const isBetweenSameMarks =
                  nextTextNode && nextTextNode[markKey];

                if (!isBetweenSameMarks) {
                  marksToRemove.push(markKey);
                }
              }

              if (marksToRemove.length > 0) {
                editor.tf.removeMarks(marksToRemove);
                insertText(text, options);

                return true;
              }
            };

            if (apply()) {
              return;
            }

            return insertText(text, options);
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
