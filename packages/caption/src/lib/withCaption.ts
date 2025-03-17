import {
  type OverrideEditor,
  type TRange,
  getPluginTypes,
  isHotkey,
  NodeApi,
  RangeApi,
} from '@udecode/plate';

import { type CaptionConfig, BaseCaptionPlugin } from './BaseCaptionPlugin';

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
export const withCaption: OverrideEditor<CaptionConfig> = ({
  editor,
  getOptions,
  tf: { apply },
}) => {
  return {
    transforms: {
      apply(operation) {
        const { plugins } = getOptions();

        if (operation.type === 'set_selection') {
          const newSelection = {
            ...editor.selection,
            ...operation.newProperties,
          } as TRange | null;

          if (
            editor.currentKeyboardEvent &&
            isHotkey('up', editor.currentKeyboardEvent) &&
            newSelection &&
            RangeApi.isCollapsed(newSelection)
          ) {
            const types = getPluginTypes(editor, plugins!);

            const entry = editor.api.above({
              at: newSelection,
              match: { type: types },
            });

            if (entry) {
              const [node] = entry;

              if (
                node.caption &&
                NodeApi.string({ children: node.caption } as any).length > 0
              ) {
                setTimeout(() => {
                  editor.setOption(BaseCaptionPlugin, 'focusEndPath', entry[1]);
                }, 0);
              }
            }
          }
        }

        apply(operation);
      },
    },
  };
};
