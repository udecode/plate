import React from 'react';
import { SPEditor } from '@udecode/plate-core';
import { indent, outdent } from './transforms/index';

export const getIndentOnKeyDown = (editor: SPEditor) => (
  event: React.KeyboardEvent
): void => {
  if (
    event.key === 'Tab' &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  ) {
    event.shiftKey ? outdent(editor) : indent(editor);
  }
};
