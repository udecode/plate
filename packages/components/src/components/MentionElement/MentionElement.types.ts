import {
  HtmlAttributesProps,
  MentionNode,
  MentionNodeData,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';

export interface MentionElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert MentionElement classNames below
}

export interface MentionElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert MentionElement style props below
  selected?: boolean;
  focused?: boolean;
}

// renderElement options given as props
export interface MentionRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    MentionElementStyleProps,
    MentionElementStyles
  >;

  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: (mentionNode: MentionNode) => void;
  renderLabel?: (mentionable: MentionNodeData) => string;
}

// renderElement props
export interface MentionElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    MentionRenderElementPropsOptions {
  element: MentionNode;
}
