import type { KeyboardHandler } from '@udecode/plate-common/react';

import {
  isCollapsed,
  select,
  someNode,
  unhangRange,
} from '@udecode/plate-common';
import { Hotkeys } from '@udecode/plate-common/react';
import { Range } from 'slate';

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
    if (!isCollapsed(editor.selection)) {
      const { anchor, focus } = Range.isBackward(selection)
        ? { anchor: { ...selection.focus }, focus: { ...selection.anchor } }
        : { anchor: { ...selection.anchor }, focus: { ...selection.focus } };

      // This is a workaround for a Slate bug
      // See: https://github.com/ianstormtaylor/slate/pull/5039
      const unHungRange = unhangRange(editor, { anchor, focus });

      if (unHungRange) {
        workRange = unHungRange;
        select(editor, unHungRange);
      }
    }

    // check if we're in a list context.
    const listSelected = someNode(editor, {
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
