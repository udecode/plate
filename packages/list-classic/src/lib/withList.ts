import { type OverrideEditor, KEYS, RangeApi } from '@udecode/plate';

import type { ListConfig } from './BaseListPlugin';

import { unwrapList } from '.';
import { moveListItems } from './transforms/index';
import { withDeleteBackwardList } from './withDeleteBackwardList';
import { withDeleteForwardList } from './withDeleteForwardList';
import { withDeleteFragmentList } from './withDeleteFragmentList';
import { withInsertBreakList } from './withInsertBreakList';
import { withInsertFragmentList } from './withInsertFragmentList';
import { withNormalizeList } from './withNormalizeList';

export const withList: OverrideEditor<ListConfig> = (ctx) => {
  const {
    editor,
    getOptions,
    tf: { resetBlock, tab },
  } = ctx;

  return {
    transforms: {
      resetBlock: (options) => {
        if (
          editor.api.block({
            at: options?.at,
            match: { type: editor.getType(KEYS.li) },
          })
        ) {
          unwrapList(editor);
          return;
        }

        return resetBlock(options);
      },
      tab: (options) => {
        const apply = () => {
          let workRange = editor.selection;

          if (editor.selection) {
            const { selection } = editor;

            // Unhang the expanded selection
            if (!editor.api.isCollapsed()) {
              const { anchor, focus } = RangeApi.isBackward(selection)
                ? {
                    anchor: { ...selection.focus },
                    focus: { ...selection.anchor },
                  }
                : {
                    anchor: { ...selection.anchor },
                    focus: { ...selection.focus },
                  };

              // This is a workaround for a Slate bug
              // See: https://github.com/ianstormtaylor/slate/pull/5039
              const unhangRange = editor.api.unhangRange({ anchor, focus });

              if (unhangRange) {
                workRange = unhangRange;
                editor.tf.select(unhangRange);
              }
            }

            // check if we're in a list context.
            const listSelected = editor.api.some({
              match: { type: editor.getType(KEYS.li) },
            });

            if (workRange && listSelected) {
              moveListItems(editor, {
                at: workRange,
                enableResetOnShiftTab: getOptions().enableResetOnShiftTab,
                increase: !options.reverse,
              });

              return true; // Prevent default
            }
          }
        };

        if (apply()) return true;

        return tab(options);
      },
      ...withInsertBreakList(ctx).transforms,
      ...withDeleteBackwardList(ctx).transforms,
      ...withDeleteForwardList(ctx as any).transforms,
      ...withDeleteFragmentList(ctx as any).transforms,
      ...withInsertFragmentList(ctx as any).transforms,
      ...withNormalizeList(ctx as any).transforms,
    },
  };
};
