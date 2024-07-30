import {
  type InsertNodesOptions,
  type PlateEditor,
  type Value,
  insertNodes,
} from '@udecode/plate-common';

import type { TCalloutElement } from '../hooks';

import { ELEMENT_CALLOUT } from '../CalloutPlugin';

export const insertCallout = <V extends Value>(
  editor: PlateEditor<V>,
  options?: InsertNodesOptions<V>
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
