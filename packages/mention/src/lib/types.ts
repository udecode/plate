import type { TElement } from '@udecode/plate';

export interface TMentionElement extends TElement {
  value: string;
}

export interface TMentionInputElement extends TElement {
  trigger: string;
}

export interface TMentionItemBase {
  text: string;
  key?: any;
}
