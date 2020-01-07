import React from 'react';
import { RenderElementProps } from 'slate-react';
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
}: RenderElementProps) => (
  <StyledBlockquoteElement {...attributes}>{children}</StyledBlockquoteElement>
);
