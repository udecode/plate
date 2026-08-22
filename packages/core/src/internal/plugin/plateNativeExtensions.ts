import { dom, type DOMExtension } from '@platejs/plite-dom';
import { react, type ReactExtension } from '@platejs/plite-react';

/** Exact native descriptors shared by Plate's canonical DOM/React graph. */
export const plateDOMExtension: DOMExtension = dom();
export const plateReactExtension: ReactExtension = react({
  dom: plateDOMExtension,
});
