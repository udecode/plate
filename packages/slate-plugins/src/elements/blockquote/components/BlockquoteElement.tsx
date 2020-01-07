import React from 'react';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';

const StyledBlockquoteElement = styled.blockquote`
  border-left: 2px solid #ddd;
  padding: 10px 20px 10px 16px;
  color: #aaa;

  [dir='rtl'] {
    border-left: none;
    border-right: 2px solid #ddd;
    padding-left: 0;
    padding-right: 16px;
  }

  margin-block-start: 0;
  margin-block-end: 0;
  margin-inline-start: 0;
  margin-inline-end: 0;

  margin: 8px 0;
`;

export const BlockquoteElement = ({
  attributes,
  children,
}: RenderElementProps) => (
  <StyledBlockquoteElement {...attributes}>{children}</StyledBlockquoteElement>
);
