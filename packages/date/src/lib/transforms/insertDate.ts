import {
  type InsertNodesOptions,
  type SlateEditor,
  insertNodes,
} from '@udecode/plate-common';

import { type TDateElement, BaseDatePlugin } from '../BaseDatePlugin';

export const insertDate = (
  editor: SlateEditor,
  { date, ...options }: { date?: string } & InsertNodesOptions = {}
) => {
  insertNodes<TDateElement | { text: string }>(
    editor,
    [
      {
        children: [{ text: '' }],
        date: date ?? new Date().toDateString(),
        type: editor.getType(BaseDatePlugin),
      },
      // FIXME: for not losing the editor focus
      {
        text: ' ',
      },
    ],
    options as any
  );
};
