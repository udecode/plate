import React from 'react';
import { PlateEditor } from '@udecode/plate-core';
import { indent, outdent } from './transforms/index';

export const getIndentOnKeyDown = () => (editor: PlateEditor) => (
  e: React.KeyboardEvent
): void => {
  if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    e.shiftKey ? outdent(editor) : indent(editor);
  }
};
