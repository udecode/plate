import type { SlateEditor } from '@udecode/plate-common';

export const addSelectedRow = (
  editor: SlateEditor,
  id: string,
  options: { aboveHtmlNode?: HTMLDivElement; clear?: boolean } = {}
) => {
  const { blockSelectionStore } = editor as any;

  if (blockSelectionStore) {
    blockSelectionStore.set.addSelectedRow(id, options);
  }
};
