import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderLeafProps } from 'slate-react';
import { StyledComponentStyles } from '../../../components/StyledComponent/StyledComponent.types';

export interface PreviewLeafProps extends RenderLeafProps {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<PreviewLeafStyleProps, StyledComponentStyles>;

  /**
   * Additional class name to provide on the root element.
   */
  className?: string;
}

export interface PreviewLeafStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert BlockquoteElement classNames below
}

export interface PreviewLeafStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert PreviewLeaf style props below
  bold?: boolean;
  italic?: boolean;
  title?: boolean;
  list?: boolean;
  hr?: boolean;
  blockquote?: boolean;
  code?: boolean;
}
