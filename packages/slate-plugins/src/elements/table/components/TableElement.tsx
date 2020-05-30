import * as React from 'react';
import styled from 'styled-components';
import { TableRenderElementProps } from '../types';

export const StyledTable = styled.table`
  margin: 10px 0;
  border-collapse: collapse;
  width: 100%;
`;

export const TableElement = ({
  attributes,
  children,
}: TableRenderElementProps) => (
  <StyledTable {...attributes}>
    <tbody>{children}</tbody>
  </StyledTable>
);
