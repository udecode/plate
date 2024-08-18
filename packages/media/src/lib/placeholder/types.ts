import type { TElement } from '@udecode/plate-common';

export interface TPlaceholderElement extends TElement {
  mediaType: string;
}

export interface PlaceholderRule {
  mediaType: string;
}

export interface MediaPlaceholder {
  rules?: PlaceholderRule[];
}
