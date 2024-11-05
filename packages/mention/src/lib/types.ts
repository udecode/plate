import type { TElement } from '@udecode/plate-common';

export interface TMentionItemBase {
  key?: any;
  text: string;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface TMentionElement extends TElement {
  value: string;
}
