import type { TElement } from '@udecode/plate';

export interface TLinkElement extends TElement {
  url: string;
  target?: string;
}
