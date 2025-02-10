import { PathApi } from '@udecode/plate';
import { useElementSelector } from '@udecode/plate/react';

import { getTableOverriddenColSizes } from '../../../lib';
import { useTableValue } from '../../stores';
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
  const colSizeOverrides = useTableValue('colSizeOverrides');

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
