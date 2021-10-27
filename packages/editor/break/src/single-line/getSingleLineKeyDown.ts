import { KeyboardHandler } from '@udecode/plate-core';

export const getSingleLineKeyDown = (): KeyboardHandler => () => (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};
