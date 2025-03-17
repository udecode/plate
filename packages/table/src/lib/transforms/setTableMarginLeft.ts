import type { EditorAboveOptions, SlateEditor } from '@udecode/plate';

import type { TTableElement } from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const setTableMarginLeft = (
  editor: SlateEditor,
  { marginLeft }: { marginLeft: number },
  options: EditorAboveOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: BaseTablePlugin.key },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  editor.tf.setNodes<TTableElement>({ marginLeft }, { at: tablePath });
};
