import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  TElement,
  useElementProps,
  Value,
} from '@udecode/plate-common';

export type TableRowElementRootProps = PlateRenderElementProps<
  Value,
  TElement
> &
  HTMLPropsAs<'tr'>;

export const TableRowElementRoot = createComponentAs<TableRowElementRootProps>(
  (props) => createElementAs('tr', useElementProps<TElement, 'tr'>(props))
);

export const TableRowElement = {
  Root: TableRowElementRoot,
};
