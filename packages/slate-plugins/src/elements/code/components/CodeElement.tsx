import React from 'react';
import { CodeRenderElementProps } from 'elements/code/types';
import styled from 'styled-components';

const Pre = styled.pre`
  padding: 10px;
  background-color: #eee;
  white-space: pre-wrap;
`;

export const CodeElement = ({
  attributes,
  children,
}: CodeRenderElementProps) => (
  <Pre>
    <code {...attributes}>{children}</code>
  </Pre>
);
