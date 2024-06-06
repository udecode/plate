import type { TDescendant, TElement } from '@udecode/plate-common';

export interface TCaptionElement extends TElement {
  caption?: TDescendant[];
  showCaption?: boolean;
}
