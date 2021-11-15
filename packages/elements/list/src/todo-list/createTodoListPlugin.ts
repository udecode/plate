import { getToggleElementOnKeyDown, HotkeyPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getTodoListDeserialize } from './getTodoListDeserialize';

export const ELEMENT_TODO_LI = 'action_item';

export const createTodoListPlugin = createPluginFactory<HotkeyPlugin>({
  key: ELEMENT_TODO_LI,
  isElement: true,
  deserialize: getTodoListDeserialize(),
  handlers: {
    onKeyDown: getToggleElementOnKeyDown(),
  },
  options: {
    hotkey: ['mod+opt+4', 'mod+shift+4'],
  },
});
