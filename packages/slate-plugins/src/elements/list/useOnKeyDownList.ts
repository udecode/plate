import { isFirstChild } from '@udecode/slate-plugins-common';
import { Editor } from 'slate';
import { getListItemEntry } from './queries/getListItemEntry';
import { moveListItemDown } from './transforms/moveListItemDown';
import { moveListItemUp } from './transforms/moveListItemUp';

export const useOnKeyDownList = () => (e: KeyboardEvent, editor: Editor) => {
  let moved: boolean | undefined = false;

  if (e.key === 'Tab') {
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
  }
};
