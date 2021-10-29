import React from 'react';
import { SPEditor } from '@udecode/plate-core';
import { indentList, outdentList } from './transforms/index';

export const getIndentListOnKeyDown = (editor: SPEditor) => (
  event: React.KeyboardEvent
) => {
  if (
    event.key === 'Tab' &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.shiftKey ? outdentList(editor) : indentList(editor);
  }
};
