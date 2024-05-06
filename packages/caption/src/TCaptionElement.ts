import type { TDescendant, TElement } from '@udecode/plate-common/server';

export interface TCaptionElement extends TElement {
  caption?: TDescendant[];
}
