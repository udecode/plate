import { IStyle } from '@uifabric/styling';
import { IStyleFunctionOrObject } from '@uifabric/utilities';
import { RenderElementProps } from 'slate-react';
import {
  Deserialize,
  ElementWithAttributes,
  HtmlAttributesProps,
  NodeToProps,
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
  // Function to match mentionnables for a given search
  mentionableFilter?: (
    search: string
  ) => (mentionable: MentionNodeData) => boolean;
  // Regex Pattern of a mentionable. Some may want to match emails, so default \W is not enough
  mentionableSearchPattern?: string;

  // Insert space after mention (defaults to false)
  insertSpaceAfterMention?: boolean;
}

// Data of Element node
export interface MentionNodeData {
  value: string;
  [key: string]: any;
}
// Element node
export interface MentionNode extends ElementWithAttributes, MentionNodeData {}

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

export type MentionKeyOption = 'mention';

// Plugin options
export type MentionPluginOptionsValues = RenderNodeOptions &
  RootProps<MentionRenderElementPropsOptions> &
  NodeToProps<MentionNode, MentionRenderElementPropsOptions> &
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
