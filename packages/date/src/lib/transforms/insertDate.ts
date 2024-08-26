import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import { DatePlugin, type TDateElement } from '../DatePlugin';

export const insertDate = <E extends SlateEditor>(
  editor: SlateEditor,
  { date, ...options }: { date?: string } & InsertNodesOptions<E> = {}
) => {
  insertNodes<{ text: string } | TDateElement>(
    editor,
    [
      {
        children: [{ text: '' }],
        date: date ?? new Date().toDateString(),
        type: editor.getType(DatePlugin),
      },
      // FIXME: for not losing the editor focus
      {
        text: ' ',
      },
    ],
    options as any
  );
};
