import React from 'react';
import { RenderLeafProps } from 'slate-react';
import styled from 'styled-components';
import { MARK_STRIKETHROUGH } from './types';

const StrikethroughText = styled.span`
  text-decoration: line-through;
`;

export const renderLeafStrikethrough = ({
  typeStrikethrough = MARK_STRIKETHROUGH,
}) => ({ children, leaf }: RenderLeafProps) => {
  if (leaf[typeStrikethrough]) {
    return (
      <StrikethroughText data-slate-type={typeStrikethrough}>
        {children}
      </StrikethroughText>
    );
  }

  return children;
};
