import { PathApi } from '@udecode/plate';
import { useElementSelector, useStoreValue } from '@udecode/plate/react';

import { getTableOverriddenColSizes } from '../../../lib';
import { useTableStore } from '../../stores';
import { TablePlugin } from '../../TablePlugin';

/**
 * Returns colSizes with overrides applied. Unset node.colSizes if `colCount`
 * updates to 1.
 */
export const useTableColSizes = ({
  disableOverrides = false,
  transformColSizes,
}: {
  disableOverrides?: boolean;
  transformColSizes?: (colSizes: number[]) => number[];
} = {}): number[] => {
  const colSizeOverrides = useStoreValue(useTableStore(), 'colSizeOverrides');

  const overriddenColSizes = useElementSelector(
    ([tableNode]) => {
      const colSizes = getTableOverriddenColSizes(
        tableNode,
        disableOverrides ? undefined : colSizeOverrides
      );

      if (transformColSizes) {
        return transformColSizes(colSizes);
      }

      return colSizes;
    },
    [disableOverrides, colSizeOverrides, transformColSizes],
    {
      key: TablePlugin.key,
      equalityFn: (a, b) => !!a && !!b && PathApi.equals(a, b),
    }
  );

  return overriddenColSizes;
};
