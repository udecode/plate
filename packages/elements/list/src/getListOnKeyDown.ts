import { isFirstChild, mapSlatePluginKeysToOptions } from '@udecode/slate-plugins-common';
import { getSlatePluginTypes, SPEditor, KeyboardHandler } from '@udecode/slate-plugins-core';
import isHotkey from 'is-hotkey';
import { castArray } from 'lodash';
import { Editor, Path, Transforms } from 'slate';

import { getListItemEntry } from './queries/getListItemEntry';
import { isAcrossListItems } from './queries/isAcrossListItems';
import { moveListItemDown } from './transforms/moveListItemDown';
import { moveListItemUp } from './transforms/moveListItemUp';
import { ELEMENT_UL, ELEMENT_OL } from './defaults.ts';
import { toggleList } from './transforms/toggleList.ts';

export const getListOnKeyDown = (pluginKeys?: string | string[]): KeyboardHandler => (editor) => (e) => {
  const listTypes = getSlatePluginTypes([ELEMENT_UL, ELEMENT_OL])(editor);
  const options = pluginKeys ? mapSlatePluginKeysToOptions(editor, pluginKeys) : [];
  let moved: boolean | undefined = false;

  if (e.key === 'Tab') {
    const res = getListItemEntry(editor, {});
    if (!res) return;

    // TODO: handle multiple li
    if (isAcrossListItems(editor)) {
      const { selection } = editor;
      const { anchor: { path: fromPath }, focus: { path: toPath } } = selection!;
      // this won't work if it's across multiple blocks so the method below should work
      // find the latest common parent of the two elements
      let counter = 0;
      while (fromPath[counter] === toPath[counter]) {
        counter++;
      }
      const pathEndpoints = [fromPath[counter], toPath[counter]]
      pathEndpoints.sort()
      const [startSibling, endSibling] = pathEndpoints;
      if (e.shiftKey) {
        const parentList = Editor.node(editor, fromPath.slice(0, counter));
        const [parentItem, parentPath] = parentList;
        for (let s = endSibling; s >= startSibling; s--) {
          console.log(s);
          let toDedentPath = fromPath.slice(0, counter).concat(s);
          let toDedentItem = Editor.node(editor, toDedentPath);
          // the parent list will keep changing during the loop so it's best to use its path only
          const currentParent = Editor.node(editor, parentPath);
          moved = moveListItemUp(editor, { list: currentParent as any, listItem: toDedentItem as any });
          moved && e.preventDefault();
        }
      } else {
        // the logic is the same because the path of the item to indent is invariant
        let toIndentPath = fromPath.slice(0, counter).concat(startSibling);
        let toIndentItem = Editor.node(editor, toIndentPath);
        console.log(toIndentItem);
        for (let s = startSibling; s <= endSibling; s++) {
          moveListItemDown(editor, { list, listItem: (toIndentItem as any) });
        } 
        e.preventDefault();
      }

      return;
    };

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
          toggleList(editor, { type })
        }
      }
    })

  }
};
