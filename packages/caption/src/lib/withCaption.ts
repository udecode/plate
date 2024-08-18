import type { Range } from 'slate';

import {
  type WithOverride,
  getAboveNode,
  getNodeString,
  getPluginTypes,
  isCollapsed,
  isHotkey,
} from '@udecode/plate-common';

import type { CaptionConfig } from './CaptionPlugin';

import { captionGlobalStore } from './captionGlobalStore';

/** TODO: tests https://github.com/udecode/editor-protocol/issues/79 */

/**
 * Selection table:
 *
 * - If anchor is in table, focus in a block before: set focus to start of table
 * - If anchor is in table, focus in a block after: set focus to end of table
 * - If focus is in table, anchor in a block before: set focus to end of table
 * - If focus is in table, anchor in a block after: set focus to the point before
 *   start of table
 */
export const withCaption: WithOverride<CaptionConfig> = ({
  editor,
  options,
}) => {
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
        isHotkey('up', editor.currentKeyboardEvent as any) &&
        newSelection &&
        isCollapsed(newSelection)
      ) {
        const types = getPluginTypes(editor, pluginKeys!);

        const entry = getAboveNode(editor, {
          at: newSelection,
          match: { type: types },
        });

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
