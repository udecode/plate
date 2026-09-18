import { type EditorElementProps, EditorElement } from 'platejs/static';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from 'platejs/table';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function TableElementStatic({
  children,
  ...props
}: EditorElementProps<typeof BaseTablePlugin>) {
  return (
    <EditorElement
      {...props}
      className="overflow-x-auto py-5"
      style={{ paddingLeft: props.element.marginLeft }}
    >
      <div className="group/table relative w-fit">
        <table
          className="mr-0 ml-px table h-px table-fixed border-collapse"
          style={{ borderCollapse: 'collapse', width: '100%' }}
        >
          <tbody className="min-w-full">{children}</tbody>
        </table>
      </div>
    </EditorElement>
  );
}

export function TableRowElementStatic(
  props: EditorElementProps<typeof BaseTableRowPlugin>
) {
  return (
    <EditorElement {...props} as="tr" className="h-full">
      {props.children}
    </EditorElement>
  );
}

export function TableCellElementStatic(
  props: EditorElementProps<typeof BaseTableCellPlugin>
) {
  const { editor, element } = props;
  const isHeader = element.header === true;
  const table = editor.plugin(BaseTablePlugin);

  const info = table.read.cell({ at: element });
  const { borders, size } = info ?? {
    borders: undefined,
    size: { minHeight: 0, width: 0 },
  };

  return (
    <EditorElement
      {...props}
      as={isHeader ? 'th' : 'td'}
      className={cn(
        'h-full overflow-visible border-none bg-background p-0',
        element.backgroundColor ? 'bg-(--cellBackground)' : 'bg-background',
        isHeader && 'text-left font-normal *:m-0',
        'before:size-full',
        "before:absolute before:box-border before:select-none before:content-['']",
        borders &&
          cn(
            borders.bottom?.width && 'before:border-b before:border-b-border',
            borders.right?.width && 'before:border-r before:border-r-border',
            borders.left?.width && 'before:border-l before:border-l-border',
            borders.top?.width && 'before:border-t before:border-t-border'
          )
      )}
      style={
        {
          '--cellBackground': element.backgroundColor,
          maxWidth: size.width || 240,
          minWidth: size.width || 120,
        } as React.CSSProperties
      }
      attributes={{
        ...props.attributes,
        colSpan: info?.colSpan ?? element.colSpan ?? 1,
        rowSpan: info?.rowSpan ?? element.rowSpan ?? 1,
      }}
    >
      <div
        className="relative z-20 box-border h-full px-4 py-2"
        style={{ minHeight: size.minHeight }}
      >
        {props.children}
      </div>
    </EditorElement>
  );
}

export const BaseTableKit = [
  BaseTablePlugin.configure({ component: TableElementStatic }),
  BaseTableRowPlugin.configure({
    component: TableRowElementStatic,
  }),
  BaseTableCellPlugin.configure({
    component: TableCellElementStatic,
  }),
];
