import type { InsertNodesOptions, SlateEditor } from '@udecode/plate';

import { type TDateElement, BaseDatePlugin } from '../BaseDatePlugin';

export const insertDate = (
  editor: SlateEditor,
  { date, ...options }: { date?: string } & InsertNodesOptions = {}
) => {
  editor.tf.insertNodes<TDateElement | { text: string }>(
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
