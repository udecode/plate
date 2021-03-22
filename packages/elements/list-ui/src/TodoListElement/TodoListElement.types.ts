import { IStyle } from '@uifabric/styling';

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
