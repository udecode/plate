import { getToggleElementOnKeyDown, HotkeyPlugin } from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getTodoListDeserialize } from './getTodoListDeserialize';

export const ELEMENT_TODO_LI = 'action_item';

export const createTodoListPlugin = createPlugin<HotkeyPlugin>({
  key: ELEMENT_TODO_LI,
  isElement: true,
  deserialize: getTodoListDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(),
  hotkey: ['mod+opt+4', 'mod+shift+4'],
});
