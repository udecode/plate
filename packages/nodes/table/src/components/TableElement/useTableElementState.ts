import { useElement } from '@udecode/plate-common';
import { useTableStore } from '../../stores/tableStore';
import { useTableColSizes } from './useTableColSizes';

export interface TableElementState {
  colSizes: number[];

  isSelectingCell: boolean;
}

export const useTableElementState = ({
  transformColSizes,
}: {
  /**
   * Transform node column sizes
   */
  transformColSizes?: (colSizes: number[]) => number[];
} = {}): TableElementState => {
  const element = useElement();
  const selectedCells = useTableStore().get.selectedCells();

  let colSizes = useTableColSizes(element);

  if (transformColSizes) {
    colSizes = transformColSizes(colSizes);
  }

  // add a last col to fill the remaining space
  if (!colSizes.some((size) => size === 0)) {
    colSizes.push('100%' as any);
  }

  return {
    colSizes,
    isSelectingCell: !!selectedCells,
  };
};
