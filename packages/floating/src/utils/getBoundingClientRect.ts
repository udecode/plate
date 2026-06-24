import type { Location, Range } from '@platejs/plite';
import type { PlateEditor } from 'platejs/react';

import { PathApi } from 'platejs';

import { mergeClientRects } from './mergeClientRects';

export const getBoundingClientRect = (
  editor: PlateEditor,
  at?: Location | Location[]
): DOMRect | undefined => {
  const atRanges: Range[] = (() => {
    if (!at) return [editor.selection].filter(Boolean) as Range[];

    const atArray = Array.isArray(at) && !PathApi.isPath(at) ? at : [at];

    return atArray.map((location) => editor.api.range(location)!);
  })();

  const clientRects = atRanges
    .map((range) =>
      editor.api.dom.resolveDOMRange(range)?.getBoundingClientRect()
    )
    .filter(Boolean) as DOMRect[];

  if (clientRects.length === 0) return;

  return mergeClientRects(clientRects);
};
