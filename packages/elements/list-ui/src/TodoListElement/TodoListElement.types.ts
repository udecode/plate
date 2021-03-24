import { TodoListItemNodeData } from '@udecode/slate-plugins-list';
import {
  ClassName,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { IStyle } from '@uifabric/styling';

export interface TodoListElementStyleProps
  extends ClassName,
    TodoListItemNodeData {}

export interface TodoListElementStyleSet extends RootStyleSet {
  checkboxWrapper?: IStyle;
  checkbox?: IStyle;
  text?: IStyle;
}

export type TodoListElementProps = StyledElementProps<
  TodoListItemNodeData,
  TodoListElementStyleProps,
  TodoListElementStyleSet
>;
