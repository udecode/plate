import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_TODO_LI } from './defaults';
import { getTodoListDeserialize } from './getTodoListDeserialize';

export const createTodoListPlugin = (): PlatePlugin => ({
  pluginKeys: ELEMENT_TODO_LI,
  renderElement: getRenderElement(ELEMENT_TODO_LI),
  deserialize: getTodoListDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_TODO_LI),
});
