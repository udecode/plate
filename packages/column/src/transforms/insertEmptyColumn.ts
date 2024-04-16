import {
  ELEMENT_DEFAULT,
  getQueryOptions,
  insertNodes,
  InsertNodesOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN } from '../createColumnPlugin';
import { TColumnElement } from '../types';

export const insertEmptyColumn = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V> & { width?: string }
) => {
  const width = options?.width || '33%';

  insertNodes<TColumnElement>(
    editor,
    {
      type: ELEMENT_COLUMN,
      children: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
      width,
    },
    getQueryOptions(editor, options)
  );
};
