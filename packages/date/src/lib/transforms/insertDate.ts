import type { InsertNodesOptions, SlateEditor, TDateElement } from 'platejs';

import { KEYS } from 'platejs';

import { normalizeDateValue } from '../utils/dateValue';

export const insertDate = (
  editor: SlateEditor,
  { date, ...options }: { date?: string } & InsertNodesOptions = {}
) => {
  const normalized = normalizeDateValue(date ?? new Date());

  editor.tf.insertNodes<TDateElement | { text: string }>(
    [
      {
        children: [{ text: '' }],
        ...normalized,
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
