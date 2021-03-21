import { isFirstChild } from '@udecode/slate-plugins-common';
import { OnKeyDown } from '@udecode/slate-plugins-core';
import { getListItemEntry } from './queries/getListItemEntry';
import { isAcrossListItems } from './queries/isAcrossListItems';
import { moveListItemDown } from './transforms/moveListItemDown';
import { moveListItemUp } from './transforms/moveListItemUp';

export const useOnKeyDownList = (): OnKeyDown => (editor) => (e) => {
  let moved: boolean | undefined = false;

  if (e.key === 'Tab') {
    const res = getListItemEntry(editor, {});
    if (!res) return;

    // TODO: handle multiple li
    if (isAcrossListItems(editor, options)) return;

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
  }
};
