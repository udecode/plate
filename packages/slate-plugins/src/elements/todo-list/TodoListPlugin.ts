import {
  getPluginOnKeyDownElement,
  getPluginRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_TODO_LI } from './defaults';
import { useDeserializeTodoList } from './useDeserializeTodoList';

export const TodoListPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_TODO_LI,
  renderElement: getPluginRenderElement(ELEMENT_TODO_LI),
  deserialize: useDeserializeTodoList(),
  onKeyDown: getPluginOnKeyDownElement(ELEMENT_TODO_LI),
});
