import {
  ELEMENT_DEFAULT,
  getQueryOptions,
  insertNodes,
  InsertNodesOptions,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_LAYOUT_CHILD } from '../createLayoutPlugin';
import { TLayoutChildElement } from '../layout-store';

export const insertEmptyLayoutChild = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V> & { width?: string }
) => {
  const width = options?.width || '33%';

  insertNodes<TLayoutChildElement>(
    editor,
    {
      type: ELEMENT_LAYOUT_CHILD,
      children: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
      width,
    },
    getQueryOptions(editor, options)
  );
};
