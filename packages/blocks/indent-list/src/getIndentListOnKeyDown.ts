import React from 'react';
import { SPEditor } from '@udecode/plate-core';
import { indentList, outdentList } from './transforms/index';

export const getIndentListOnKeyDown = (editor: SPEditor) => (
  e: React.KeyboardEvent
) => {
  if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    e.shiftKey ? outdentList(editor) : indentList(editor);
    return true;
  }
};
