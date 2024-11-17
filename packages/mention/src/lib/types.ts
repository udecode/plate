import type { TElement } from '@udecode/plate-common';

export interface TMentionItemBase {
  text: string;
  key?: any;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface TMentionElement extends TElement {
  value: string;
}
