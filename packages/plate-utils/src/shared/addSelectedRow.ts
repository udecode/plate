import type { PlateEditor } from '@udecode/plate-core';

export const addSelectedRow = (
  editor: PlateEditor,
  id: string,
  options: { aboveHtmlNode?: HTMLDivElement; clear?: boolean } = {}
) => {
  const { blockSelectionStore } = editor as any;

  if (blockSelectionStore) {
    blockSelectionStore.set.addSelectedRow(id, options);
  }
};
