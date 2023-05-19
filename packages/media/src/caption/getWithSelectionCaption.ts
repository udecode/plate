import {
  getAboveNode,
  getNodeString,
  getPluginType,
  isCollapsed,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import isHotkey from 'is-hotkey';
import { Range } from 'slate';
import { ImagePlugin } from '../image/index';
import { TMediaElement } from '../media/index';
import { captionGlobalStore } from './captionGlobalStore';

/**
 * TODO: tests
 * https://github.com/udecode/editor-protocol/issues/79
 */

/**
 * Selection table:
 * - If anchor is in table, focus in a block before: set focus to start of table
 * - If anchor is in table, focus in a block after: set focus to end of table
 * - If focus is in table, anchor in a block before: set focus to end of table
 * - If focus is in table, anchor in a block after: set focus to the point before start of table
 */
export const getWithSelectionCaption =
  (pluginKey: string) =>
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    // eslint-disable-next-line unused-imports/no-unused-vars
    plugin: WithPlatePlugin<ImagePlugin, V, E>
  ) => {
    const { apply } = editor;

    editor.apply = (operation) => {
      if (operation.type === 'set_selection') {
        const newSelection = {
          ...editor.selection,
          ...operation.newProperties,
        } as Range | null;

        if (
          editor.currentKeyboardEvent &&
          isHotkey('up', editor.currentKeyboardEvent)
        ) {
          if (newSelection && isCollapsed(newSelection)) {
            const entry = getAboveNode<TMediaElement>(editor, {
              at: newSelection,
              match: { type: getPluginType(editor, pluginKey) },
            });

            if (entry) {
              const [node] = entry;

              if (
                node.caption &&
                getNodeString({ children: node.caption } as any).length
              ) {
                setTimeout(() => {
                  captionGlobalStore.set.focusEndCaptionPath(entry[1]);
                }, 0);
              }
            }
          }
        }
      }

      apply(operation);
    };

    return editor;
  };
