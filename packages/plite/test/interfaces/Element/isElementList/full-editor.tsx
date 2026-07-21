/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = [
  {
    children: [],
    intents: [],
    selection: null,
    addMark() {},
    deleteBackward() {},
    deleteForward() {},
    deleteFragment() {},
    insertBreak() {},
    insertSoftBreak() {},
    insertFragment() {},
    insertNode() {},
    insertText() {},
    isElementReadOnly() {},
    isInline() {},
    isSelectable() {},
    isVoid() {},
    removeMark() {},
  },
];
export const test = (value) => ElementApi.isElementList(value);
export const output = false;
