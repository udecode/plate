import * as React from 'react';

import type { TColumnElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible column component using table cell.
 */
export function ColumnElementStaticDocx(
  props: SlateElementProps<TColumnElement>
) {
  const { width } = props.element;

  return (
    <SlateElement
      {...props}
      as="td"
      style={{
        width: width ?? 'auto',
        verticalAlign: 'top',
        padding: '4px 8px',
        border: 'none',
      }}
    >
      {props.children}
    </SlateElement>
  );
}

/**
 * DOCX-compatible column group component using table layout.
 */
export function ColumnGroupElementStaticDocx(props: SlateElementProps) {
  return (
    <SlateElement {...props}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: 'none',
          tableLayout: 'fixed',
        }}
      >
        <tbody>
          <tr>{props.children}</tr>
        </tbody>
      </table>
    </SlateElement>
  );
}
