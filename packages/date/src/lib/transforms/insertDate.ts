import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TDateElement } from '../BaseDatePlugin';

export const insertDate = (
  editor: SlateEditor,
  { date, ...options }: { date?: string } & InsertNodesOptions = {}
) => {
  editor.tf.insertNodes<TDateElement | { text: string }>(
    [
      {
        children: [{ text: '' }],
        date: date ?? new Date().toDateString(),
        type: editor.getType(KEYS.date),
      },
      // FIXME: for not losing the editor focus
      {
        text: ' ',
      },
    ],
    options as any
  );
};
