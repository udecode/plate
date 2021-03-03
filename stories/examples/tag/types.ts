import {
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
  StyledComponentStyleProps,
  StyledComponentStyles,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export interface UseTagOptions extends TagPluginOptions {
  // Character triggering the tag select
  trigger?: string;
  // Maximum number of suggestions
  maxSuggestions?: number;
}

// Data of Element node
export interface TagNodeData {
  value: string;
  [key: string]: any;
}
// Element node
export interface TagNode extends Element, TagNodeData {}

// renderElement options given as props
export interface TagRenderElementPropsOptions {
  /**
   * Call to provide customized styling that will layer on top of the variant rules.
   */
  styles?: IStyleFunctionOrObject<
    StyledComponentStyleProps,
    StyledComponentStyles
  >;
}

// renderElement props
export interface TagElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    TagRenderElementPropsOptions {
  element: TagNode;
}

export type TagKeyOption = 'tag';

// Plugin options
export type TagPluginOptionsValues = RenderNodeOptions &
  RootProps<TagRenderElementPropsOptions>;
export type TagPluginOptionsKeys = keyof TagPluginOptionsValues;
export type TagPluginOptions<
  Value extends TagPluginOptionsKeys = TagPluginOptionsKeys
> = Partial<Record<TagKeyOption, Pick<TagPluginOptionsValues, Value>>>;

// renderElement options
export type TagRenderElementOptionsKeys = TagPluginOptionsKeys;
export interface TagRenderElementOptions
  extends TagPluginOptions<'type' | 'component' | 'rootProps'> {}

// deserialize options
export interface TagDeserializeOptions
  extends TagPluginOptions<'type' | 'rootProps'> {}

export interface WithTagOptions extends TagPluginOptions<'type'> {}

export interface TagOptions extends TagPluginOptions<'type'> {}

export interface TagElementStyles {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  link?: IStyle;
}

export interface TagElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  selected?: boolean;
  focused?: boolean;
}
