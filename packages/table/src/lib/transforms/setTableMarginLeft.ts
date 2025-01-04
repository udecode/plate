import type { GetAboveNodeOptions, SlateEditor } from '@udecode/plate-common';

import type { TTableElement } from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const setTableMarginLeft = (
  editor: SlateEditor,
  { marginLeft }: { marginLeft: number },
  options: GetAboveNodeOptions = {}
) => {
  const table = editor.api.find<TTableElement>({
    match: { type: BaseTablePlugin.key },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;

  editor.tf.setNodes<TTableElement>({ marginLeft }, { at: tablePath });
};
