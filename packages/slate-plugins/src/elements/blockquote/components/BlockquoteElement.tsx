import React from 'react';
import { BlockquoteRenderElementProps } from 'elements/blockquote/types';
import styled from 'styled-components';

const StyledBlockquoteElement = styled.blockquote`
  border-left: 2px solid #ddd;
  padding: 10px 20px 10px 16px;
  color: #aaa;

  margin: 8px 0;
`;

export const BlockquoteElement = ({
  attributes,
  children,
}: BlockquoteRenderElementProps) => (
  <StyledBlockquoteElement {...attributes}>{children}</StyledBlockquoteElement>
);
