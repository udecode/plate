import { type Location, PathApi, type Range, type Value } from '@platejs/plite';
import type { DOMEditor } from '@platejs/plite-dom';

import { mergeClientRects } from './mergeClientRects';

export const getBoundingClientRect = <V extends Value>(
  editor: DOMEditor<V>,
  at?: Location | Location[]
): DOMRect | undefined => {
  const atRanges: Range[] = (() => {
    if (!at) {
      const selection = editor.read.selection();

      return selection ? [selection] : [];
    }

    const atArray = Array.isArray(at) && !PathApi.isPath(at) ? at : [at];

    return atArray.flatMap((location) => {
      const range = editor.read.ranges.get(location);

      return range ? [range] : [];
    });
  })();

  const clientRects = atRanges
    .map((range) =>
      editor.api.dom.resolveDOMRange(range)?.getBoundingClientRect()
    )
    .filter((rect): rect is DOMRect => Boolean(rect));

  if (clientRects.length === 0) return;

  return mergeClientRects(clientRects);
};
