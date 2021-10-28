import React from 'react';
import { TEditor } from '@udecode/plate-core';
import { indentList, outdentList } from './transforms/index';

export const getIndentListOnKeyDown = (editor: TEditor) => (
  event: React.KeyboardEvent
): void => {
  if (
    event.key === 'Tab' &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.shiftKey ? outdentList(editor) : indentList(editor);
  }
};
