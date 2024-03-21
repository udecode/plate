import {
  createPluginFactory,
  onKeyDownToggleElement,
} from '@udecode/plate-common';

import { ELEMENT_INDENT_TODO } from './types';
import { withIndentTodo } from './withIndentTodo';

export const createIndentTodoPlugin = createPluginFactory({
  key: ELEMENT_INDENT_TODO,
  isElement: true,
  withOverrides: withIndentTodo,
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: 'mod+shift+.',
  },
});
