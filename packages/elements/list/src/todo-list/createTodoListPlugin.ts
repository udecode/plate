import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_TODO_LI } from './defaults';
import { getTodoListDeserialize } from './getTodoListDeserialize';

export const createTodoListPlugin = (): PlatePlugin => ({
  key: ELEMENT_TODO_LI,
  isElement: true,
  deserialize: getTodoListDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_TODO_LI),
});
