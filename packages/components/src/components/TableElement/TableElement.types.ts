import {
  HtmlAttributesProps,
  RenderNodePropsOptions,
  TableNode,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

export interface TableElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert TableElement classNames below
}

export interface TableElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert TableElement style props below
}

// renderElement options given as props
export interface TableRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<TableElementStyleProps, TableElementStyles>;
}

// renderElement props
export interface TableElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    TableRenderElementPropsOptions {
  element: TableNode;
}
