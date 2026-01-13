import * as React from 'react';

import type { TTableCellElement, TTableElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { BaseTablePlugin } from '@platejs/table';
import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible table components.
 * Uses standard HTML/CSS borders instead of pseudo-elements for proper DOCX export.
 */

export function TableElementStaticDocx({
  children,
  ...props
}: SlateElementProps<TTableElement>) {
  return (
    <SlateElement {...props}>
      <table
        style={{
          borderCollapse: 'collapse',
          margin: '0 0 8pt 0',
          width: '100%',
        }}
      >
        <tbody>{children}</tbody>
      </table>
    </SlateElement>
  );
}

export function TableRowElementStaticDocx(props: SlateElementProps) {
  return (
    <SlateElement {...props} as="tr">
      {props.children}
    </SlateElement>
  );
}

export function TableCellElementStaticDocx({
  isHeader,
  ...props
}: SlateElementProps<TTableCellElement> & {
  isHeader?: boolean;
}) {
  const { editor, element } = props;
  const { api } = editor.getPlugin(BaseTablePlugin);

  const { width } = api.table.getCellSize({ element });
  const colSpan = api.table.getColSpan(element);
  const rowSpan = api.table.getRowSpan(element);

  const style: React.CSSProperties = {
    backgroundColor: element.background || (isHeader ? '#f5f5f5' : undefined),
    border: '1px solid #ccc',
    padding: '6pt',
    textAlign: 'left',
    verticalAlign: 'top',
    ...(width ? { width: `${width}px` } : {}),
  };

  if (isHeader) {
    style.fontWeight = 'bold';
  }

  return (
    <SlateElement
      {...props}
      as={isHeader ? 'th' : 'td'}
      style={style}
      attributes={{
        ...props.attributes,
        colSpan,
        rowSpan,
      }}
    >
      {props.children}
    </SlateElement>
  );
}

export function TableCellHeaderElementStaticDocx(
  props: SlateElementProps<TTableCellElement>
) {
  return <TableCellElementStaticDocx {...props} isHeader />;
}
