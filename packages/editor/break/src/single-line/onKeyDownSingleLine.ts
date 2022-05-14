import { KeyboardHandlerReturnType } from '@udecode/plate-core';

export const onKeyDownSingleLine = (): KeyboardHandlerReturnType => (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};
