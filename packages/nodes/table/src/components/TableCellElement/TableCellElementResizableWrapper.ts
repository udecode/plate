import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { useTableStore } from '../../stores/tableStore';
import { TableCellElementState } from './useTableCellElementState';

export type TableCellElementResizableWrapperProps = HTMLPropsAs<'div'> &
  Pick<TableCellElementState, 'colIndex'>;

export const useTableCellElementResizableWrapperProps = ({
  colIndex,
  ...props
}: TableCellElementResizableWrapperProps): HTMLPropsAs<'div'> => {
  const [, setHoveredColIndex] = useTableStore().use.hoveredColIndex();

  return {
    contentEditable: false,
    onMouseOver: () => setHoveredColIndex(colIndex),
    onFocus: () => setHoveredColIndex(colIndex),
    onMouseOut: () => setHoveredColIndex(null),
    onBlur: () => setHoveredColIndex(null),
    ...props,
  };
};

export const TableCellElementResizableWrapper = createComponentAs<TableCellElementResizableWrapperProps>(
  (props) => {
    const htmlProps = useTableCellElementResizableWrapperProps(props);

    return createElementAs('div', htmlProps);
  }
);
