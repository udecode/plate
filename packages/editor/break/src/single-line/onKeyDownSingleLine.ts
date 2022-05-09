import { KeyboardHandler, Value } from '@udecode/plate-core';

export const onKeyDownSingleLine: KeyboardHandler<Value> = () => (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};
