import type { TElement } from '@udecode/plate-common';

export interface TPlaceholderElement extends TElement {
  mediaType: string;
}

export interface placeholderRule {
  mediaType: string;
}

export interface MediaPlaceholder {
  rules?: placeholderRule[];
}
