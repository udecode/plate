import { RenderElementOptions } from 'element/types';
import { Element, Node } from 'slate';
import { RenderElementProps } from 'slate-react';

export const MENTION = 'mention';

export interface OnKeyDownMentionOptions {
  mentionables: MentionableItem[];
  index: number;
  target: any;
  setIndex: any;
  setTarget: any;
}

export interface MentionOptions {
  trigger: string;
  prefix: string;
  maxSuggestions: number;
}

export interface MentionableItem {
  value: string;
  [key: string]: any;
}

export interface MentionNode extends Element {
  type: typeof MENTION;
  prefix: string;
  mentionable: MentionableItem;
  children: Node[];
}

export interface MentionRenderElementProps extends RenderElementProps {
  element: MentionNode;
}

export interface MentionRenderElementOptions extends RenderElementOptions {
  onClick: (mentionable: MentionableItem) => void;
}
