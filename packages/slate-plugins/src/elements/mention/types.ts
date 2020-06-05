import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';
import { RenderElementOptions } from '../../element';

export const MENTION = 'mention';

// useMention options
export interface UseMentionOptions {
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

// Type option
interface TypeOption {
  typeMention?: string;
}

// renderElement options given as props
interface MentionRenderElementOptionsProps {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: ({ value }: { value: string }) => void;
}

// renderElement options
export interface MentionRenderElementOptions
  extends RenderElementOptions,
    MentionRenderElementOptionsProps,
    TypeOption {}

// renderElement props
export interface MentionRenderElementProps
  extends RenderElementProps,
    MentionRenderElementOptionsProps {
  element: MentionNode;
}

export interface MentionDeserializeOptions extends TypeOption {}

// Plugin options
export interface MentionPluginOptions
  extends MentionRenderElementOptions,
    MentionDeserializeOptions {}
