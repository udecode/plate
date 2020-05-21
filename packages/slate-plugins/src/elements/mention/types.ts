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

export interface MentionPluginOptions extends MentionRenderElementOptions {}

export interface MentionRenderElementOptions extends RenderElementOptions {
  typeMention?: string;
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
}

export interface MentionableItem {
  value: string;
  [key: string]: unknown;
}

export interface MentionNode extends Element, MentionableItem {}

export interface MentionRenderElementProps extends RenderElementProps {
  element: MentionNode;
  /**
   * Prefix rendered before mention
   */
  prefix?: string;
}
