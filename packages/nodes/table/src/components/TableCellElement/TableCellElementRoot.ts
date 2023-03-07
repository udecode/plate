import { useEffect } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  TElement,
  useElementProps,
  Value,
} from '@udecode/plate-common';
import { useTableStore } from '../../stores/tableStore';

export type TableCellElementRootProps = PlateRenderElementProps<
  Value,
  TElement
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

  return useElementProps(props);
};

export const TableCellElementRoot = createComponentAs<TableCellElementRootProps>(
  (props) => {
    const htmlProps = useTableCellElementRootProps(props);

    return createElementAs('td', htmlProps);
  }
);
