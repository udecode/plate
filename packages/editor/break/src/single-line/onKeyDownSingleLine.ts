import { KeyboardHandler } from '@udecode/plate-core';

export const onKeyDownSingleLine: KeyboardHandler = () => (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};
