import React from 'react';
import { RenderLeafProps } from 'slate-react';
import styled from 'styled-components';
import { MARK_STRIKETHROUGH } from './types';

const StrikethroughText = styled.span`
  text-decoration: line-through;
`;

export const renderLeafStrikethrough = () => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[MARK_STRIKETHROUGH]) {
    return <StrikethroughText>{children}</StrikethroughText>;
  }

  return children;
};
