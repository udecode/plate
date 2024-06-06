import type { PlateEditor } from '@udecode/plate-core';
import type { Value } from '@udecode/slate';

export const addSelectedRow = <V extends Value>(
  editor: PlateEditor<V>,
  id: string,
  options: { aboveHtmlNode?: HTMLDivElement; clear?: boolean } = {}
) => (editor as any).addSelectedRow(id, options);
