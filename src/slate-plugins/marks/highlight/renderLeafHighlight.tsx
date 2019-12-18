import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { RenderLeafHighlightOptions } from './types';

export const renderLeafHighlight = ({
  style = { backgroundColor: '#ffeeba' },
}: RenderLeafHighlightOptions = {}) => ({
  children,
  leaf: { highlight },
}: RenderLeafProps) => <span style={highlight && style}>{children}</span>;
