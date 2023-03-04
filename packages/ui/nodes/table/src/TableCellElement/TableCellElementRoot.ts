import { useEffect } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  useElementProps,
  Value,
} from '@udecode/plate-core';
import { TTableElement } from '@udecode/plate-table';
import { useTableStore } from '../table.atoms';

export type TableCellElementRootProps = PlateRenderElementProps<
  Value,
  TTableElement
> &
  HTMLPropsAs<'td'>;

export const useTableCellElementRootProps = (
  props: TableCellElementRootProps
): HTMLPropsAs<'td'> => {
  const { element } = props;

  const setHoveredColIndex = useTableStore().set.hoveredColIndex();

  useEffect(() => {
    setHoveredColIndex(null);
  }, [element, setHoveredColIndex]);

  // const rootProps = getRootProps(props);

  return useElementProps(props);
};

export const TableCellElementRoot = createComponentAs<TableCellElementRootProps>(
  (props) => {
    const htmlProps = useTableCellElementRootProps(props);

    return createElementAs('td', htmlProps);
  }
);
