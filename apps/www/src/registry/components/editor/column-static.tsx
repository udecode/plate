import { BaseColumnItemPlugin, BaseColumnPlugin } from '@platejs/layout';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

export function ColumnElementStatic(
  props: PliteElementProps<typeof BaseColumnItemPlugin>
) {
  const { width } = props.element;

  return (
    <div className="group/column relative" style={{ width: width ?? '100%' }}>
      <PliteElement
        className="h-full px-2 pt-2 group-first/column:pl-0 group-last/column:pr-0"
        {...props}
      >
        <div className="relative h-full border border-transparent p-1.5">
          {props.children}
        </div>
      </PliteElement>
    </div>
  );
}

export function ColumnGroupElementStatic(
  props: PliteElementProps<typeof BaseColumnPlugin>
) {
  return (
    <PliteElement className="mb-2" {...props}>
      <div className="flex size-full rounded">{props.children}</div>
    </PliteElement>
  );
}

/**
 * DOCX-compatible column component using table cell.
 */
export function ColumnElementDocx(
  props: PliteElementProps<typeof BaseColumnItemPlugin>
) {
  const { width } = props.element;

  return (
    <PliteElement
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
    </PliteElement>
  );
}

/**
 * DOCX-compatible column group component using table layout.
 */
export function ColumnGroupElementDocx(
  props: PliteElementProps<typeof BaseColumnPlugin>
) {
  return (
    <PliteElement {...props}>
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
    </PliteElement>
  );
}

export const BaseColumnKit = [
  BaseColumnPlugin.configure({
    component: ColumnGroupElementStatic,
  }),
  BaseColumnItemPlugin.configure({
    component: ColumnElementStatic,
  }),
];
