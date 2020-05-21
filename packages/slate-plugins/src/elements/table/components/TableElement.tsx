import React from 'react';
import { TableRenderElementProps } from 'elements/table/types';
import styled from 'styled-components';

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
