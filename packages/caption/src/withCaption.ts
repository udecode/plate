import {
  getAboveNode,
  getNodeString,
  getPluginTypes,
  isCollapsed,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import isHotkey from 'is-hotkey';
import { Range } from 'slate';

import { captionGlobalStore } from './captionGlobalStore';
import { CaptionPlugin } from './createCaptionPlugin';

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
export const withCaption = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  // eslint-disable-next-line unused-imports/no-unused-vars
  { options }: WithPlatePlugin<CaptionPlugin, V, E>
) => {
  const { apply } = editor;

  const { pluginKeys } = options;

  editor.apply = (operation) => {
    if (operation.type === 'set_selection') {
      const newSelection = {
        ...editor.selection,
        ...operation.newProperties,
      } as Range | null;

      if (
        editor.currentKeyboardEvent &&
        isHotkey('up', editor.currentKeyboardEvent) &&
        newSelection &&
        isCollapsed(newSelection)
      ) {
        const types = getPluginTypes(editor, pluginKeys);

        const entry = getAboveNode(editor, {
          at: newSelection,
          match: { type: types },
        });
        console.log(2, entry);

        if (entry) {
          const [node] = entry;

          if (
            node.caption &&
            getNodeString({ children: node.caption } as any).length > 0
          ) {
            setTimeout(() => {
              captionGlobalStore.set.focusEndCaptionPath(entry[1]);
            }, 0);
          }
        }
      }
    }

    apply(operation);
  };

  return editor;
};
