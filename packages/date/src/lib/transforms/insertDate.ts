import type { InsertNodesOptions, SlateEditor, TDateElement } from 'platejs';

import { KEYS } from 'platejs';

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
