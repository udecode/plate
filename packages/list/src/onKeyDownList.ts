import type { KeyboardHandler } from '@udecode/plate-common';

import {
  getPluginType,
  isCollapsed,
  isHotkey,
  select,
  someNode,
  unhangRange,
} from '@udecode/plate-common';
import { Hotkeys } from '@udecode/plate-common/react';
import castArray from 'lodash/castArray.js';
import { Range } from 'slate';

import type { ListPluginOptions } from './types';

import { ListItemPlugin } from './ListPlugin';
import { moveListItems, toggleList } from './transforms/index';

export const onKeyDownList: KeyboardHandler<ListPluginOptions> = ({
  editor,
  event,
  plugin: {
    options: { enableResetOnShiftTab, hotkey },
    type,
  },
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
      match: { type: editor.getType(ListItemPlugin) },
    });

    if (workRange && listSelected) {
      event.preventDefault();
      moveListItems(editor, {
        at: workRange,
        enableResetOnShiftTab,
        increase: isTab,
      });

      return true;
    }
  }
  if (!hotkey) return;

  const hotkeys = castArray(hotkey);

  for (const _hotkey of hotkeys) {
    if (isHotkey(_hotkey)(event as any)) {
      toggleList(editor, { type: type! });
    }
  }
};
