import React from 'react';
import { RenderLeafProps } from 'slate-react';
import styled from 'styled-components';
import { MARK_CODE } from './types';

const Code = styled.code`
  font-family: monospace;
  background-color: #eee;
  font-size: 12px;
  padding: 3px;
`;

export const renderLeafInlineCode = () => ({
  children,
  leaf,
}: RenderLeafProps) => {
  if (leaf[MARK_CODE]) return <Code>{children}</Code>;

  return children;
};
