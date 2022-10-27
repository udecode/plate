import { TElement } from '@udecode/plate-core';

export interface TCloudImageElement extends TElement {
  url: string;
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
}
