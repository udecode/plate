import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { RenderLeafHighlightOptions } from './RenderLeafHighlightOptions';

export const renderLeafHighlight = ({
  style = { backgroundColor: '#ffeeba' },
}: RenderLeafHighlightOptions = {}) => ({
  children,
  leaf: { highlight },
}: RenderLeafProps) => {
  return <span style={highlight && style}>{children}</span>;
};
