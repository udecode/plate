import type {
  AnyPluginConfig,
  BaseEditor,
  BasePlugin,
  PlatePluginTxGroup,
} from '@platejs/core';
import { RangeApi, SelectionApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type {
  ListPluginOptions,
  ListPluginTransaction,
} from './BaseListPlugin';

import { moveListItems } from './transforms';
import {
  toggleBulletedList,
  toggleList,
  toggleNumberedList,
  toggleTaskList,
} from './transforms';

type ListTransactionContext<C extends AnyPluginConfig> = {
  editor: BaseEditor;
  getOptions: () => ListPluginOptions;
  plugin: BasePlugin<C>;
};

export const withList =
  <C extends AnyPluginConfig>({
    editor,
    getOptions,
  }: ListTransactionContext<C>): PlatePluginTxGroup<ListPluginTransaction, C> =>
  (tx) => {
    const apply = (reverse: boolean) => {
      const selection = tx.selection();

      if (!selection) return false;

      let workRange = selection;

      if (!tx.selection.isCollapsed()) {
        const { anchor, focus } = RangeApi.isBackward(selection)
          ? {
              anchor: { ...selection.focus },
              focus: { ...selection.anchor },
            }
          : {
              anchor: { ...selection.anchor },
              focus: { ...selection.focus },
            };
        const unhangRange = tx.ranges.unhang({ anchor, focus });

        if (unhangRange) {
          workRange = SelectionApi.text(unhangRange);
          tx.selection.set(workRange);
        }
      }

      if (
        !tx.nodes.some({
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
