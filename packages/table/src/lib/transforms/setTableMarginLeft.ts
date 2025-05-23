import type { EditorAboveOptions, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TTableElement } from '../types';

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
