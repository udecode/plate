import React from 'react';
import { SPEditor } from '@udecode/plate-core';
import { indent, outdent } from './transforms/index';

export const getIndentOnKeyDown = () => (editor: SPEditor) => (
  e: React.KeyboardEvent
): void => {
  if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    e.shiftKey ? outdent(editor) : indent(editor);
  }
};
