import { TElement } from '@udecode/plate-common/server';

export interface TLinkElement extends TElement {
  url: string;
  target?: string;
}
