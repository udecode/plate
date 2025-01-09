import {
  type Editor,
  type TLocation,
  type TRange,
  PathApi,
} from '@udecode/plate';

import { mergeClientRects } from './mergeClientRects';

export const getBoundingClientRect = (
  editor: Editor,
  at?: TLocation | TLocation[]
): DOMRect | undefined => {
  const atRanges: TRange[] = (() => {
    if (!at) return [editor.selection].filter(Boolean) as TRange[];

    const atArray = Array.isArray(at) && !PathApi.isPath(at) ? at : [at];

    return atArray.map((location) => editor.api.range(location)!);
  })();

  const clientRects = atRanges
    .map((range) => editor.api.toDOMRange(range)?.getBoundingClientRect())
    .filter(Boolean) as DOMRect[];

  if (clientRects.length === 0) return undefined;

  return mergeClientRects(clientRects);
};
