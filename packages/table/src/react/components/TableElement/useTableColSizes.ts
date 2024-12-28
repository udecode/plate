import { useElementSelector } from '@udecode/plate-common/react';
import { Path } from 'slate';

import { getTableOverriddenColSizes } from '../../../lib';
import { TablePlugin } from '../../TablePlugin';
import { useTableStore } from '../../stores';

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
  const colSizeOverrides = useTableStore().get.colSizeOverrides();

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
      equalityFn: (a, b) => !!a && !!b && Path.equals(a, b),
    }
  );

  return overriddenColSizes;
};
