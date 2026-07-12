import type { ClientRectObject } from '@floating-ui/core';
import type { Range, Value } from '@platejs/plite';
import type { DOMCapableEditor } from '@platejs/plite-dom';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

/** Get bounding client rect by slate range */
export const getRangeBoundingClientRect = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: DOMCapableEditor<V, TExtensions>,
  at: Range | null
): ClientRectObject => {
  if (!at) return getDefaultBoundingClientRect();

  const domRange = editor.api.dom.resolveDOMRange(at);

  if (!domRange) return getDefaultBoundingClientRect();

  return domRange.getBoundingClientRect();
};
