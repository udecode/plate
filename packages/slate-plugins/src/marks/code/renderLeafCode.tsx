import * as React from 'react';
import styled from 'styled-components';
import { CodeRenderLeafOptions, CodeRenderLeafProps, MARK_CODE } from './types';

const Code = styled.code`
  font-family: monospace;
  background-color: #eee;
  font-size: 12px;
  padding: 3px;
`;

export const renderLeafCode = ({
  typeCode = MARK_CODE,
}: CodeRenderLeafOptions = {}) => ({ children, leaf }: CodeRenderLeafProps) => {
  if (leaf[typeCode]) return <Code>{children}</Code>;

  return children;
};
