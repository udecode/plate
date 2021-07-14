import { TodoListItemNodeData } from '@udecode/slate-plugins-list';
import { StyledElementProps } from '@udecode/slate-plugins-styled-components';
import { CSSProp } from 'styled-components';

export interface TodoListElementStyleProps extends TodoListElementProps {
  checked?: boolean;
}

export interface TodoListElementStyles {
  checkboxWrapper: CSSProp;
  checkbox: CSSProp;
  text: CSSProp;
  rootChecked?: CSSProp;
}

export type TodoListElementProps = StyledElementProps<
  TodoListItemNodeData,
  TodoListElementStyles
>;
