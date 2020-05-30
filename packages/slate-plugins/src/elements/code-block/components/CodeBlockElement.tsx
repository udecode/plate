import * as React from 'react';
import styled from 'styled-components';
import { CodeBlockRenderElementProps } from '../types';

const Pre = styled.pre`
  padding: 10px;
  background-color: #eee;
  white-space: pre-wrap;
`;

export const CodeBlockElement = ({
  attributes,
  children,
}: CodeBlockRenderElementProps) => (
  <Pre>
    <code {...attributes}>{children}</code>
  </Pre>
);
