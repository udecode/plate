import {
  useOnKeyDownElement,
  useRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_TODO_LI } from './defaults';
import { useDeserializeTodoList } from './useDeserializeTodoList';

export const TodoListPlugin = (): SlatePlugin => ({
  elementKeys: ELEMENT_TODO_LI,
  renderElement: useRenderElement(ELEMENT_TODO_LI),
  deserialize: useDeserializeTodoList(),
  onKeyDown: useOnKeyDownElement(ELEMENT_TODO_LI),
});
