import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import {
  Deserialize,
  HtmlAttributesProps,
  RenderNodeOptions,
  RenderNodePropsOptions,
  RootProps,
} from '../../common/types/PluginOptions.types';

// useMention options
export interface UseMentionOptions extends MentionPluginOptions {
  // Character triggering the mention select
  trigger?: string;
  // Maximum number of suggestions
  maxSuggestions?: number;
}

// Data of Element node
export interface MentionNodeData {
  value: string;
  [key: string]: any;
}
// Element node
export interface MentionNode extends Element, MentionNodeData {}

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
  onClick?: ({ value }: { value: string }) => void;
}

// renderElement props
export interface MentionElementProps
  extends RenderElementProps,
    RenderNodePropsOptions,
    HtmlAttributesProps,
    MentionRenderElementPropsOptions {
  element: MentionNode;
}

export type MentionKeyOption = 'mention';

// Plugin options
export type MentionPluginOptionsValues = RenderNodeOptions &
  RootProps<MentionRenderElementPropsOptions> &
  Deserialize;
export type MentionPluginOptionsKeys = keyof MentionPluginOptionsValues;
export type MentionPluginOptions<
  Value extends MentionPluginOptionsKeys = MentionPluginOptionsKeys
> = Partial<Record<MentionKeyOption, Pick<MentionPluginOptionsValues, Value>>>;

// renderElement options
export type MentionRenderElementOptionsKeys = MentionPluginOptionsKeys;
export interface MentionRenderElementOptions
  extends MentionPluginOptions<MentionRenderElementOptionsKeys> {}

// deserialize options
export interface MentionDeserializeOptions
  extends MentionPluginOptions<'type' | 'rootProps' | 'deserialize'> {}

export interface WithMentionOptions extends MentionPluginOptions<'type'> {}

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
