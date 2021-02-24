import {
  ElementWithAttributes,
  NodeToProps,
  RenderNodeOptions,
} from '@udecode/slate-plugins-common';

// Data of Element node
export interface TodoListNodeData {
  checked?: boolean;
}
// Element node
export interface TodoListNode extends ElementWithAttributes, TodoListNodeData {}

export type TodoListKeyOption = 'todo_li';

// Plugin options
export type TodoListPluginOptionsValues = RenderNodeOptions &
  NodeToProps<TodoListNode>;
export type TodoListPluginOptionsKeys = keyof TodoListPluginOptionsValues;
export type TodoListPluginOptions<
  Value extends TodoListPluginOptionsKeys = TodoListPluginOptionsKeys
> = Partial<
  Record<TodoListKeyOption, Pick<TodoListPluginOptionsValues, Value>>
>;

// renderElement options
export type TodoListRenderElementOptionsKeys = TodoListPluginOptionsKeys;
export interface TodoListRenderElementOptions
  extends TodoListPluginOptions<TodoListRenderElementOptionsKeys> {}

// deserialize options
export interface TodoListDeserializeOptions
  extends TodoListPluginOptions<'type' | 'rootProps'> {}

export interface WithTodoListOptions extends TodoListPluginOptions<'type'> {}
