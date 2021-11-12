import { KeyboardHandler } from '@udecode/plate-core';
import { indent, outdent } from './transforms/index';

export const getIndentOnKeyDown = (): KeyboardHandler => (editor) => (e) => {
  if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    e.shiftKey ? outdent(editor) : indent(editor);
  }
};
