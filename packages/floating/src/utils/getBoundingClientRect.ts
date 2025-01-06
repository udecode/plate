import type { Editor } from '@udecode/plate-common';

import { type Location, type Range, Path } from 'slate';

import { mergeClientRects } from './mergeClientRects';

export const getBoundingClientRect = (
  editor: Editor,
  at?: Location | Location[]
): DOMRect | undefined => {
  const atRanges: Range[] = (() => {
    if (!at) return [editor.selection].filter(Boolean) as Range[];

    const atArray = Array.isArray(at) && !Path.isPath(at) ? at : [at];

    return atArray.map((location) => editor.api.range(location)!);
  })();

  const clientRects = atRanges
    .map((range) => editor.api.toDOMRange(range)?.getBoundingClientRect())
    .filter(Boolean) as DOMRect[];

  if (clientRects.length === 0) return undefined;

  return mergeClientRects(clientRects);
};
