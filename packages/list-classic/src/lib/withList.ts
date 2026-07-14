import type { ExtendTx, PlatePluginTxGroup } from '@platejs/core';
import { RangeApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig } from './BaseListPlugin';

import { moveListItems } from './transforms';
import {
  toggleBulletedList,
  toggleList,
  toggleNumberedList,
  toggleTaskList,
} from './transforms';

export const withList: ExtendTx<
  ListConfig,
  PlatePluginTxGroup<ListConfig['tx']>
> =
  ({ editor, getOptions }) =>
  (tx) => {
    const apply = (reverse: boolean) => {
      const selection = editor.read.selection();

      if (!selection) return false;

      let workRange = selection;

      if (!editor.read.selection.isCollapsed()) {
        const { anchor, focus } = RangeApi.isBackward(selection)
          ? {
              anchor: { ...selection.focus },
              focus: { ...selection.anchor },
            }
          : {
              anchor: { ...selection.anchor },
              focus: { ...selection.focus },
            };
        const unhangRange = editor.read.ranges.unhang({ anchor, focus });

        if (unhangRange) {
          workRange = unhangRange;
          tx.selection.set(unhangRange);
        }
      }

      if (
        !editor.read.nodes.some({
          at: workRange,
          match: { type: editor.getType(KEYS.li) },
        })
      ) {
        return false;
      }

      moveListItems(editor, tx, {
        at: workRange,
        enableResetOnShiftTab: getOptions().enableResetOnShiftTab,
        increase: !reverse,
      });

      return true;
    };

    return {
      tab: () => apply(false),
      toggle: {
        bulletedList: () => toggleBulletedList(editor, tx),
        list: (options) => toggleList(editor, tx, options),
        numberedList: () => toggleNumberedList(editor, tx),
        taskList: (defaultChecked) =>
          toggleTaskList(editor, tx, defaultChecked),
      },
      untab: () => apply(true),
    };
  };
