import { getToggleElementOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderElement, SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_TODO_LI } from './defaults';
import { getTodoListDeserialize } from './getTodoListDeserialize';

export const createTodoListPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_TODO_LI,
  renderElement: getRenderElement(ELEMENT_TODO_LI),
  deserialize: getTodoListDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_TODO_LI),
});
