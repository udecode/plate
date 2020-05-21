import React from 'react';
import styled from 'styled-components';
import {
  InlineCodeRenderLeafOptions,
  InlineCodeRenderLeafProps,
  MARK_CODE,
} from './types';

const Code = styled.code`
  font-family: monospace;
  background-color: #eee;
  font-size: 12px;
  padding: 3px;
`;

export const renderLeafInlineCode = ({
  typeInlineCode = MARK_CODE,
}: InlineCodeRenderLeafOptions = {}) => ({
  children,
  leaf,
}: InlineCodeRenderLeafProps) => {
  if (leaf[typeInlineCode]) return <Code>{children}</Code>;

  return children;
};
