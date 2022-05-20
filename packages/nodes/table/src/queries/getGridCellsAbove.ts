import {
  GetAboveNodeOptions,
  getEdgeBlocksAbove,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { getCellTypes } from '../utils/getCellType';
import { getGridCellsByRange } from './getGridCellsByRange';

/**
 * Get grid cells above a location
 */
export const getGridCellsAbove = <V extends Value = Value>(
  editor: PlateEditor<V>,
  options?: GetAboveNodeOptions<V>
) => {
  const edges = getEdgeBlocksAbove<TElement>(editor, {
    match: {
      type: getCellTypes(editor),
    },
    ...options,
  });
  if (edges) {
    const [start, end] = edges;
    if (!Path.equals(start[1], end[1])) {
      return getGridCellsByRange(editor, {
        anchor: {
          path: start[1],
          offset: 0,
        },
        focus: {
          path: end[1],
          offset: 0,
        },
      });
    }

    return [start[0]];
  }
};
