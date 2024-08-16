import {
  type InsertNodesOptions,
  type PlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import type { TCalloutElement } from '../hooks';

import { CalloutPlugin } from '../CalloutPlugin';

export const insertCallout = <E extends PlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TCalloutElement>(
    editor,
    {
      children: [{ text: '' }],
      type: editor.getType(CalloutPlugin),
      variant: 'info',
    },
    options as any
  );
};
