import * as React from 'react';
import styled from 'styled-components';
import {
  HighlightRenderLeafOptions,
  HighlightRenderLeafProps,
  MARK_HIGHLIGHT,
} from './types';

const HighlightText = styled.mark<{ bg: string }>`
  background-color: ${(props) => props.bg};
`;

export const renderLeafHighlight = ({
  typeHighlight = MARK_HIGHLIGHT,
  bg = '#ffeeba',
}: HighlightRenderLeafOptions = {}) => ({
  children,
  leaf,
}: HighlightRenderLeafProps) => {
  if (leaf[typeHighlight])
    return (
      <HighlightText data-slate-type={typeHighlight} bg={bg}>
        {children}
      </HighlightText>
    );

  return children;
};
