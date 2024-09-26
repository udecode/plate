import {
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { withTodoList } from './withTodoList';

export interface TTodoListItemElement extends TElement {
  checked?: boolean;
}

export type TodoListConfig = PluginConfig<
  'action_item',
  {
    inheritCheckStateOnLineEndBreak?: boolean;
    inheritCheckStateOnLineStartBreak?: boolean;
  }
>;

export const BaseTodoListPlugin = createTSlatePlugin<TodoListConfig>({
  key: 'action_item',
  extendEditor: withTodoList,
  node: { isElement: true },
});
