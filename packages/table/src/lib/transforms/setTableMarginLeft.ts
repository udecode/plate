import type { EditorAboveOptions, SlateEditor, TTableElement } from 'platejs';

import { KEYS } from 'platejs';

export const setTableMarginLeft = (
  editor: SlateEditor,
  { marginLeft }: { marginLeft: number },
  options: EditorAboveOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: KEYS.table },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  editor.tf.setNodes<TTableElement>({ marginLeft }, { at: tablePath });
};
