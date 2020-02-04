import React from 'react';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';
import { getElement } from '../utils';
import { RenderElementTableOptions, TableType } from './types';

const StyledTable = styled.table`
  margin: 10px 0;
  border-collapse: collapse;
  width: 100%;
`;

const Td = styled.td`
  padding: 10px;
  border: 2px solid #ddd;
`;

const TableElement = ({ attributes, children }: RenderElementProps) => (
  <StyledTable {...attributes} data-slate-type={TableType.TABLE}>
    <tbody>{children}</tbody>
  </StyledTable>
);

export const renderElementTable = ({
  Table = TableElement,
  Row = getElement('tr'),
  Cell = Td,
}: RenderElementTableOptions = {}) => (props: RenderElementProps) => {
  switch (props.element.type) {
    case TableType.TABLE:
      return <Table {...props} />;
    case TableType.ROW:
      return <Row {...props} />;
    case TableType.CELL:
      return <Cell {...props} />;
    default:
      break;
  }
};
