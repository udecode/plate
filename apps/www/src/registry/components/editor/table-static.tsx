import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function TableElementStatic({
  children,
  ...props
}: PliteElementProps<typeof BaseTablePlugin>) {
  const { disableMarginLeft } = props.editor
    .plugin(BaseTablePlugin)
    .store.get();
  const marginLeft = disableMarginLeft ? 0 : props.element.marginLeft;

  return (
    <PliteElement
      {...props}
      className="overflow-x-auto py-5"
      style={{ paddingLeft: marginLeft }}
    >
      <div className="group/table relative w-fit">
        <table
          className="mr-0 ml-px table h-px table-fixed border-collapse"
          style={{ borderCollapse: 'collapse', width: '100%' }}
        >
          <tbody className="min-w-full">{children}</tbody>
        </table>
      </div>
    </PliteElement>
  );
}

export function TableRowElementStatic(
  props: PliteElementProps<typeof BaseTableRowPlugin>
) {
  return (
    <PliteElement {...props} as="tr" className="h-full">
      {props.children}
    </PliteElement>
  );
}

export function TableCellElementStatic(
  props: PliteElementProps<typeof BaseTableCellPlugin>
) {
  const { editor, element } = props;
  const isHeader = element.header === true;
  const table = editor.plugin(BaseTablePlugin);

  const { minHeight, width } = table.read.getCellSize({ element });
  const borders = table.read.getCellBorders({ element });

  return (
    <PliteElement
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
          maxWidth: width || 240,
          minWidth: width || 120,
        } as React.CSSProperties
      }
      attributes={{
        ...props.attributes,
        colSpan: table.api.getColSpan(element),
        rowSpan: table.api.getRowSpan(element),
      }}
    >
      <div
        className="relative z-20 box-border h-full px-4 py-2"
        style={{ minHeight }}
      >
        {props.children}
      </div>
    </PliteElement>
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
