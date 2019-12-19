import React from 'react';
import { RenderLeafProps } from 'slate-react';
import styled from 'styled-components';
import { MARK_HIGHLIGHT, RenderLeafHighlightOptions } from './types';

const HighlightText = styled.span<{ bg: string }>`
  background-color: ${props => props.bg};
`;

export const renderLeafHighlight = ({
  bg = '#ffeeba',
}: RenderLeafHighlightOptions = {}) => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[MARK_HIGHLIGHT])
    return <HighlightText bg={bg}>{children}</HighlightText>;

  return children;
};
