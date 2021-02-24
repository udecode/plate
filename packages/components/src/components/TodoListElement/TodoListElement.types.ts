import {
  HtmlAttributesProps,
  RenderNodePropsOptions,
  TodoListNode,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { RenderElementProps } from 'slate-react';
import { StyledComponentPropsOptions } from '../StyledComponent/StyledComponent.types';

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

// renderElement options given as props
export interface TodoListRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface TodoListElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    TodoListRenderElementPropsOptions {
  element: TodoListNode;
}
