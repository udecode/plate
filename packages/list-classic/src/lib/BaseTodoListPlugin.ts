import {
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
  KEYS,
} from '@udecode/plate';

import { withTodoList } from './withTodoList';

export type TodoListConfig = PluginConfig<
  'action_item',
  {
    inheritCheckStateOnLineEndBreak?: boolean;
    inheritCheckStateOnLineStartBreak?: boolean;
  }
>;

export interface TTodoListItemElement extends TElement {
  checked?: boolean;
}

export const BaseTodoListPlugin = createTSlatePlugin<TodoListConfig>({
  key: KEYS.listTodoClassic,
  node: { isElement: true },
}).overrideEditor(withTodoList);
