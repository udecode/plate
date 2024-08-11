import {
  type InsertNodesOptions,
  type PlateEditor,
  type ValueOf,
  insertNodes,
} from '@udecode/plate-common';

import type { TCalloutElement } from '../hooks';

import { ELEMENT_CALLOUT } from '../CalloutPlugin';

export const insertCallout = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<ValueOf<E>>
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
