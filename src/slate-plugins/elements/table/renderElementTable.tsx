import React from 'react';
import { RenderElementProps } from 'slate-react';
import { TableType } from './types';

export const renderElementTable = () => ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case TableType.TABLE:
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case TableType.ROW:
      return <tr {...attributes}>{children}</tr>;
    case TableType.CELL:
      return <td {...attributes}>{children}</td>;
    default:
      break;
  }
};
