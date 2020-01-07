import React from 'react';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';

const Pre = styled.pre`
  padding: 10px;
  background-color: #eee;
  white-space: pre-wrap;
`;

export const CodeElement = ({ attributes, children }: RenderElementProps) => (
  <Pre>
    <code {...attributes}>{children}</code>
  </Pre>
);
