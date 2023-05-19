import { useEffect } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  useElementProps,
  Value,
} from '@udecode/plate-common';
import { useTableStore } from '../../stores/tableStore';
import { TTableCellElement } from '../../types';

export type TableCellElementRootProps = PlateRenderElementProps<
  Value,
  TTableCellElement
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

  return { colSpan: element.colSpan, ...useElementProps(props) };
};

export const TableCellElementRoot =
  createComponentAs<TableCellElementRootProps>((props) => {
    const htmlProps = useTableCellElementRootProps(props);

    return createElementAs('td', htmlProps);
  });
