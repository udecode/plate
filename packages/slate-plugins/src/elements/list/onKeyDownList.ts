import { Editor } from 'slate';
import { isFirstChild } from '../../common/queries';
import { isSelectionInListItem } from './queries/isSelectionInListItem';
import { moveListItemDown } from './transforms/moveListItemDown';
import { moveListItemUp } from './transforms/moveListItemUp';
import { ListOnKeyDownOptions } from './types';

export const onKeyDownList = (options?: ListOnKeyDownOptions) => (
  e: KeyboardEvent,
  editor: Editor
) => {
  let moved: boolean | undefined = false;

  if (e.key === 'Tab') {
    const res = isSelectionInListItem(editor, options);
    if (!res) return;
    const { listNode, listPath, listItemPath } = res;

    e.preventDefault();

    // move up with shift+tab
    const shiftTab = e.shiftKey;
    if (shiftTab) {
      moved = moveListItemUp(editor, listNode, listPath, listItemPath, options);
      if (moved) e.preventDefault();
    }

    // move down with tab
    const tab = !e.shiftKey;
    if (tab && !isFirstChild(listItemPath)) {
      moveListItemDown(editor, listNode, listItemPath, options);
    }
  }
};
