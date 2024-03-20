import { createPluginFactory } from '@udecode/plate-common';

import { ELEMENT_INDENT_TODO } from './types';

export const createIndentTodoPlugin = createPluginFactory({
  key: ELEMENT_INDENT_TODO,
  isElement: true,
  // inject: { aboveComponent: injectToggle },
  // useHooks: useHooksToggle,
  // renderAboveEditable: ToggleControllerProvider,
  // withOverrides: withToggle,
});
