import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export type TableCellElementResizableWrapperProps = HTMLPropsAs<'div'>;

export const TableCellElementResizableWrapper =
  createComponentAs<TableCellElementResizableWrapperProps>((props) =>
    createElementAs('div', { contentEditable: false, ...props })
  );
