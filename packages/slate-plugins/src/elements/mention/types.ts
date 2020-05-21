import { RenderElementOptions } from 'element';
import { Element } from 'slate';
import { RenderElementProps } from 'slate-react';

export const MENTION = 'mention';

export interface UseMentionOptions {
  // Character triggering the mention select
  trigger?: string;
  // Maximum number of suggestions
  maxSuggestions?: number;
}

export interface MentionableItem {
  value: string;
  [key: string]: unknown;
}

export interface MentionNode extends Element, MentionableItem {}

export interface MentionPluginOptions extends MentionRenderElementOptions {}

export interface MentionRenderElementOptions
  extends RenderElementOptions,
    MentionRenderElementOptionsProps {
  typeMention?: string;
}

interface MentionRenderElementOptionsProps {
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
  onClick?: ({ value }: { value: string }) => void;
}

export interface MentionRenderElementProps
  extends RenderElementProps,
    MentionRenderElementOptionsProps {
  element: MentionNode;
}
