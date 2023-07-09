import { TElement } from '@udecode/plate-common';

export interface TLinkElement extends TElement {
  url: string;
  target?: string;
}
