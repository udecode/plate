import React from 'react';
import { RenderElementProps } from 'slate-react';
import { MentionElement } from './MentionElement';
import { MENTION_TYPE } from './types';

export const renderElementMention = (props: RenderElementProps) => {
  if (props.element.type === MENTION_TYPE) return <MentionElement {...props} />;
};
