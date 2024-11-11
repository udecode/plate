import { type TTableElement, getTableOverriddenRowSizes } from '../../../lib';
import { useTableStore } from '../../stores';

export const useTableRowSizes = (
  tableNode: TTableElement,
  { disableOverrides = false } = {}
): number[] => {
  const rowSizeOverrides = useTableStore().get.rowSizeOverrides();

  const overriddenRowSizes = getTableOverriddenRowSizes(
    tableNode,
    disableOverrides ? undefined : rowSizeOverrides
  );

  return overriddenRowSizes;
};
