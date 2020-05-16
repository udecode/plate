import React from 'react';
import { RenderLeafProps } from 'slate-react';
import styled from 'styled-components';
import { MARK_HIGHLIGHT, RenderLeafHighlightOptions } from './types';

const HighlightText = styled.span<{ bg: string }>`
  background-color: ${(props) => props.bg};
`;

export const renderLeafHighlight = ({
  typeHighlight = MARK_HIGHLIGHT,
  bg = '#ffeeba',
}: RenderLeafHighlightOptions = {}) => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[typeHighlight])
    return (
      <HighlightText data-slate-type={typeHighlight} bg={bg}>
        {children}
      </HighlightText>
    );

  return children;
};
