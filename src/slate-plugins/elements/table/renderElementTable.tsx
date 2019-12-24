import React from 'react';
import { RenderElementProps } from 'slate-react';
import { getElement } from '../utils';
import { RenderElementTableOptions, TableType } from './types';

const TableElement = ({ attributes, children }: RenderElementProps) => (
  <table>
    <tbody {...attributes}>{children}</tbody>
  </table>
);

export const renderElementTable = ({
  Table = TableElement,
  Row = getElement('tr'),
  Cell = getElement('td'),
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
