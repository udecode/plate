import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import { BaseCalloutPlugin, type TCalloutElement } from '../BaseCalloutPlugin';

export const insertCallout = <E extends SlateEditor>(
  editor: E,
  options?: InsertNodesOptions<E>
) => {
  insertNodes<TCalloutElement>(
    editor,
    {
      children: [{ text: '' }],
      type: editor.getType(BaseCalloutPlugin),
      variant: 'info',
    },
    options as any
  );
};
