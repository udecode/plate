import type { EditorAboveOptions, SlateEditor } from '@udecode/plate';

import type { TTableElement, TTableRowElement } from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const setTableRowSize = (
  editor: SlateEditor,
  { height, rowIndex }: { height: number; rowIndex: number },
  options: EditorAboveOptions = {}
) => {
  const table = editor.api.node<TTableElement>({
    match: { type: BaseTablePlugin.key },
    ...options,
  });

  if (!table) return;

  const [, tablePath] = table;
  const tableRowPath = [...tablePath, rowIndex];

  editor.tf.setNodes<TTableRowElement>({ size: height }, { at: tableRowPath });
};
