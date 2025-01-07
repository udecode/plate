import type { KeyboardHandler } from '@udecode/plate/react';

import { Hotkeys, RangeApi } from '@udecode/plate';

import { type ListConfig, BaseListItemPlugin } from '../lib';
import { moveListItems } from '../lib/transforms/index';

export const onKeyDownList: KeyboardHandler<ListConfig> = ({
  editor,
  event,
  getOptions,
}) => {
  if (event.defaultPrevented) return;

  const isTab = Hotkeys.isTab(editor, event);
  const isUntab = Hotkeys.isUntab(editor, event);

  let workRange = editor.selection;

  if (editor.selection && (isTab || isUntab)) {
    const { selection } = editor;

    // Unhang the expanded selection
    if (!editor.api.isCollapsed()) {
      const { anchor, focus } = RangeApi.isBackward(selection)
        ? { anchor: { ...selection.focus }, focus: { ...selection.anchor } }
        : { anchor: { ...selection.anchor }, focus: { ...selection.focus } };

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
      match: { type: editor.getType(BaseListItemPlugin) },
    });

    if (workRange && listSelected) {
      event.preventDefault();
      moveListItems(editor, {
        at: workRange,
        enableResetOnShiftTab: getOptions().enableResetOnShiftTab,
        increase: isTab,
      });

      return true;
    }
  }
};
