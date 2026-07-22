import type { ClientRectObject } from '@floating-ui/core';
import type { Range, Value } from '@platejs/plite';
import type { DOMEditor } from '@platejs/plite-dom';

import { getDefaultBoundingClientRect } from '../createVirtualElement';

/** Get bounding client rect by slate range */
export const getRangeBoundingClientRect = <V extends Value>(
  editor: DOMEditor<V>,
  at: Range | null
): ClientRectObject => {
  if (!at) return getDefaultBoundingClientRect();

  const domRange = editor.api.dom.resolveDOMRange(at);

  if (!domRange) return getDefaultBoundingClientRect();

  return domRange.getBoundingClientRect();
};
