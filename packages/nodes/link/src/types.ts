import { TElement } from '@udecode/plate-core';

export interface TLinkElement extends TElement {
  url: string;
  target?: string;
}
