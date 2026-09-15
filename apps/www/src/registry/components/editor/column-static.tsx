import { BaseColumnItemPlugin, BaseColumnPlugin } from 'platejs/layout';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function ColumnElementStatic(
  props: EditorElementProps<typeof BaseColumnItemPlugin>
) {
  const { width } = props.element;

  return (
    <div className="group/column relative" style={{ width: width ?? '100%' }}>
      <EditorElement
        className="h-full px-2 pt-2 group-first/column:pl-0 group-last/column:pr-0"
        {...props}
      >
        <div className="relative h-full border border-transparent p-1.5">
          {props.children}
        </div>
      </EditorElement>
    </div>
  );
}

export function ColumnGroupElementStatic(
  props: EditorElementProps<typeof BaseColumnPlugin>
) {
  return (
    <EditorElement className="mb-2" {...props}>
      <div className="flex size-full rounded">{props.children}</div>
    </EditorElement>
  );
}

/**
 * DOCX-compatible column component using table cell.
 */
export function ColumnElementDocx(
  props: EditorElementProps<typeof BaseColumnItemPlugin>
) {
  const { width } = props.element;

  return (
    <EditorElement
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
    </EditorElement>
  );
}

/**
 * DOCX-compatible column group component using table layout.
 */
export function ColumnGroupElementDocx(
  props: EditorElementProps<typeof BaseColumnPlugin>
) {
  return (
    <EditorElement {...props}>
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
    </EditorElement>
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
