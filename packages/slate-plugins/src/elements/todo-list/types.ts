import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';
import {
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';
import {
  StyledComponentStyleProps,
  StyledComponentStyles,
} from '../../components/StyledComponent/StyledComponent.types';

// Data of Element node
export interface TodoListNodeData {
  checked?: boolean;
}
// Element node
export interface TodoListNode extends ElementWithAttributes, TodoListNodeData {}

// renderElement options given as props
export interface TodoListRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    StyledComponentStyleProps,
    StyledComponentStyles
  >;
}

// renderElement props
export interface TodoListElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    TodoListRenderElementPropsOptions {
  element: TodoListNode;
}

export type TodoListKeyOption = 'todo_li';

// Plugin options
export type TodoListPluginOptionsValues = RenderNodeOptions &
  RootProps<TodoListRenderElementPropsOptions> &
  NodeToProps<TodoListNode, TodoListRenderElementPropsOptions>;
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

export interface TodoListElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert TodoListElement classNames below
  checkboxWrapper?: IStyle;
  checkbox?: IStyle;
  text?: IStyle;
}

export interface TodoListElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert TodoListElement style props below
  checked?: boolean;
}
