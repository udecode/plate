import React from 'react';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { RenderElementProps } from 'slate-react';

export const renderElementTable = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  switch (element.type) {
    case ElementType.TABLE:
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case ElementType.TABLE_ROW:
      return <tr {...attributes}>{children}</tr>;
    case ElementType.TABLE_CELL:
      return <td {...attributes}>{children}</td>;
    default:
      break;
  }
};
