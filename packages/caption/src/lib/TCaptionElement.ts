import type { Descendant, TElement } from '@udecode/plate-common';

export interface TCaptionElement extends TElement {
  caption?: Descendant[];
}
