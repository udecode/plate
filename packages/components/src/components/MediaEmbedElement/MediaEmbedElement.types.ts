import {
  HtmlAttributesProps,
  MediaEmbedNode,
  RenderNodePropsOptions,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { RenderElementProps } from 'slate-react';
import { StyledComponentPropsOptions } from '../StyledComponent/StyledComponent.types';

export interface MediaEmbedElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  // Insert MediaEmbedElement classNames below
  iframeWrapper?: IStyle;
  iframe?: IStyle;
  input?: IStyle;
}

export interface MediaEmbedElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  // Insert MediaEmbedElement style props below
}

// renderElement options given as props
export interface MediaEmbedRenderElementPropsOptions
  extends Omit<StyledComponentPropsOptions, 'children'> {}

// renderElement props
export interface MediaEmbedElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    MediaEmbedRenderElementPropsOptions {
  element: MediaEmbedNode;
}
