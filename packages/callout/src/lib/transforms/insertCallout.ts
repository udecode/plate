import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import { type TCalloutElement, BaseCalloutPlugin } from '../BaseCalloutPlugin';

export const insertCallout = <E extends SlateEditor>(
  editor: E,
  {
    variant,
    ...options
  }: InsertNodesOptions<E> & {
    variant?: (string & {}) | TCalloutElement['variant'];
  } = {}
) => {
  insertNodes<TCalloutElement>(
    editor,
    {
      children: [{ text: '' }],
      type: editor.getType(BaseCalloutPlugin),
      variant,
    },
    options as any
  );
};
