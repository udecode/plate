import {
  type InsertNodesOptions,
  type PlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TCalloutElement } from '../hooks';

import { ELEMENT_CALLOUT } from '../CalloutPlugin';

export const insertCallout = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TCalloutElement>(
    editor,
    {
      children: [{ text: '' }],
      type: ELEMENT_CALLOUT,
      variant: 'info',
    },
    options as any
  );
};
