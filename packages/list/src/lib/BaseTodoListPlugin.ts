import {
  type PluginConfig,
  type TElement,
  createTSlatePlugin,
} from '@udecode/plate';

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
  node: { isElement: true },
}).extendEditorTransforms(withTodoList);
