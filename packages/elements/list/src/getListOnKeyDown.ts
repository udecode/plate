import {
  findNode,
  getAbove,
  getNode,
  getNodes,
  isFirstChild,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  getSlatePluginTypes,
  KeyboardHandler,
  mapSlatePluginKeysToOptions,
  TElement,
} from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { Editor } from 'slate';
import { getListItemEntry } from './queries/getListItemEntry';
import { isAcrossListItems } from './queries/isAcrossListItems';
import { moveListItemDown } from './transforms/moveListItemDown';
import { moveListItemUp } from './transforms/moveListItemUp';
import { toggleList } from './transforms/toggleList';
import { unwrapList } from './transforms/unwrapList';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getListOnKeyDown = (
  pluginKeys?: string | string[]
): KeyboardHandler => (editor) => (e) => {
  const listTypes = getSlatePluginTypes([ELEMENT_UL, ELEMENT_OL])(editor);
  const options = pluginKeys
    ? mapSlatePluginKeysToOptions(editor, pluginKeys)
    : [];
  let moved: boolean | undefined = false;

  if (e.key === 'Tab') {
    if (isAcrossListItems(editor)) {
      const list = findNode<TElement>(editor, {
        match: { type: listTypes },
      });

      if (!list) return;

      const { selection } = editor;
      const {
        anchor: { path: fromPath },
        focus: { path: toPath },
      } = selection!;
      // this won't work if it's across multiple blocks so the method below should work
      // find the latest common parent of the two elements
      // const nodes = getNodes(editor, { at: selection! });
      // console.log([...nodes]);

      let counter = 0;
      while (fromPath[counter] === toPath[counter]) {
        counter++;
      }

      const pathEndpoints = [fromPath[counter], toPath[counter]];
      pathEndpoints.sort();
      const [startSibling, endSibling] = pathEndpoints;

      if (e.shiftKey) {
        const parentList = Editor.node(editor, fromPath.slice(0, counter));
        const [, parentPath] = parentList;

        for (let s = endSibling; s >= startSibling; s--) {
          const toDedentPath = fromPath.slice(0, counter).concat(s);
          const toDedentItem = Editor.node(editor, toDedentPath);
          // the parent list will keep changing during the loop so it's best to use its path only
          const currentParent = Editor.node(editor, parentPath);

          moved = moveListItemUp(editor, {
            list: currentParent as any,
            listItem: toDedentItem as any,
          });
          moved && e.preventDefault();
        }
      } else {
        // the logic is the same because the path of the item to indent is invariant
        const toIndentPath = fromPath.slice(0, counter).concat(startSibling);
        const toIndentItem = Editor.node(editor, toIndentPath);

        for (let s = startSibling; s <= endSibling; s++) {
          moveListItemDown(editor, { list, listItem: toIndentItem as any });
        }

        e.preventDefault();
      }

      return;
    }

    const res = getListItemEntry(editor, {});
    if (!res) return;

    const { list, listItem } = res;
    const [, listItemPath] = listItem;

    e.preventDefault();

    // move up with shift+tab
    const shiftTab = e.shiftKey;
    if (shiftTab) {
      moved = moveListItemUp(editor, { list, listItem });
      if (moved) e.preventDefault();
    }

    // move down with tab
    const tab = !e.shiftKey;
    if (tab && !isFirstChild(listItemPath)) {
      moveListItemDown(editor, { list, listItem });
    }
  } else {
    options.forEach(({ type, hotkey }) => {
      if (!hotkey) return;

      const hotkeys = castArray(hotkey);

      for (const key of hotkeys) {
        if (isHotkey(key)(e as any) && listTypes.includes(type)) {
          e.preventDefault();
          toggleList(editor, { type });
        }
      }
    });
  }
};
