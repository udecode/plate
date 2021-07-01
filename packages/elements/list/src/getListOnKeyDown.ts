import { getNodes, getParent } from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  getSlatePluginTypes,
  KeyboardHandler,
  mapSlatePluginKeysToOptions,
} from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { NodeEntry, Path } from 'slate';
import { moveListItemDown } from './transforms/moveListItemDown';
import { moveListItemUp } from './transforms/moveListItemUp';
import { toggleList } from './transforms/toggleList';
import { ELEMENT_LIC, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getListOnKeyDown = (
  pluginKeys?: string | string[]
): KeyboardHandler => (editor) => (e) => {
  const listTypes = getSlatePluginTypes([ELEMENT_UL, ELEMENT_OL])(editor);

  if (e.key === 'Tab') {
    e.preventDefault();

    // Get the selected lic
    const [...lics] = getNodes(editor, {
      at: editor.selection!,
      match: {
        type: getSlatePluginType(editor, ELEMENT_LIC),
      },
    });

    if (!lics.length) return;

    const highestLics: NodeEntry[] = [];

    // Filter out the nested lic, we just need to move the highest ones
    lics.forEach((lic) => {
      const licPath = lic[1];
      const liPath = Path.parent(licPath);

      const isAncestor = highestLics.some((highestLic) => {
        const highestLiPath = Path.parent(highestLic[1]);

        return Path.isAncestor(highestLiPath, liPath);
      });
      if (!isAncestor) {
        highestLics.push(lic);
      }
    });

    highestLics.reverse().forEach((highestLic) => {
      const listItem = getParent(editor, highestLic[1]);
      if (!listItem) return;
      const listEntry = getParent(editor, listItem[1]);

      if (!e.shiftKey) {
        moveListItemDown(editor, {
          list: listEntry as any,
          listItem: listItem as any,
        });
      } else {
        moveListItemUp(editor, {
          list: listEntry as any,
          listItem: listItem as any,
        });
      }
    });

    return;
  }

  const options = pluginKeys
    ? mapSlatePluginKeysToOptions(editor, pluginKeys)
    : [];

  options.forEach(({ type, hotkey }) => {
    if (!hotkey) return;

    const hotkeys = castArray(hotkey);

    for (const key of hotkeys) {
      if (isHotkey(key)(e as any) && listTypes.includes(type)) {
        toggleList(editor, { type });
      }
    }
  });
};
